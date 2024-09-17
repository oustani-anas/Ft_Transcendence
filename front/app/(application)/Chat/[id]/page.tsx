'use client'
import axios from 'axios';
import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import { RootState } from '@/redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { selectProfileInfo } from '@/redux/features/profile/profileSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { setRefreshConvos } from '@/redux/features/chatSlices/refreshSlice';
import NotUser from '../NotUser';
import { io, } from '@/../../node_modules/socket.io-client/build/esm/index';
import Cookies from "js-cookie";

export default function Page(props: any) {

  const [message, setMssage] = useState("");
  const [DMsSettings, setDMsSettings] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [Password, setPassword] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [groupData, setGroupData] = useState<any>([]);
  const [refresh, setRefresh] = useState(true);
  const [refreshStatus, setRefreshStatus] = useState(true);
  const [blockType, setBlockType] = useState<string>();
  const [memberSettings, setMemberSettings] = useState(Array(groupData?.members?.length || 0).fill(false));
  const [refreshNotifs, setRefreshNoifications] = useState(false)
  const [myBlockList, setMyBlockList] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [clicked, setIsclicked] = useState(false);
  const scrolToBottom = useRef<any>(null);

  const refreshConvos = useSelector((state: RootState) => state.refresh.refresh);
  const dispatch = useDispatch();

  const userData = useSelector(selectProfileInfo);
  const socket = useSelector((state: RootState) => state.socket.socket);
  const router = useRouter();

  const token = Cookies.get("JWT_TOKEN");

  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  useEffect(() => {
    const fetchChatGroups = async () => {

      try {
        
        
        socket.emit('addSocketToThisUserRoom', props.params.id);
        const response = await axios.get(`${url}/chat/getGroupByGroupId?groupId=${props.params.id}&&myId=${userData.id}`, { withCredentials: true });
        if (response.status === 200) {
          const msgs = await axios.get(`${url}/chat/getMsgsByGroupId?groupId=${props.params.id}&&myId=${userData.id}`, { withCredentials: true });
          const blockListResponse = await axios.get(`${url}/user/myBlockList?myId=${userData.id}`, { withCredentials: true });
          setMyBlockList(blockListResponse.data);
          setMessages(msgs.data.message);
          const data = response.data;
          setGroupData(data.data);
          
          if (data.data.type === "DM") {

            const myData = await axios.get(`${url}/user/getUserByUserId?user=${userData.id}`, { withCredentials: true });
            const isFriend = await axios.get(`${url}/user/checkIfFriend?myId=${userData.id}&&receiverId=${data.data.members[0].id}`, { withCredentials: true });

            if (myData.data.blockedByUsers.some((userid: any) => userid === data.data.members[0].id))
              setBlockType("blockedBy")
            else if (myData.data.blockedUsers.some((userid: any) => userid === data.data.members[0].id))
              setBlockType("blockedUser")
            else if (isFriend.data)
              setBlockType("friends")
            else
              setBlockType("")
            setIsLoading(true)
          }
        }
      } catch (error: any) {
        setGroupData(error.response.status);
      }
    };

    fetchChatGroups();
  }, [props.params.id, refresh, refreshNotifs, refreshStatus]);


  const handleToggleSettings = (index: any) => {
    const newMemberSettings = [...memberSettings];
    if (memberSettings[index] === true) {
      newMemberSettings.fill(false);
      setMemberSettings(newMemberSettings);
      return
    }
    newMemberSettings.fill(false);
    newMemberSettings[index] = !newMemberSettings[index];
    setMemberSettings(newMemberSettings);
  };

  function handleChannelCommands(arg: string, data: any, index: any, duration:string) {
    
    socket?.emit(arg, {
      username: userData.username,
      message: "",
      userId: userData.id,
      target_username: data.username,
      target: data.id,
      roomId: groupData?.id,
      duration: duration,
      token: token
    })
    handleToggleSettings(index);
  }

  useEffect(() => {
    socket?.on("refreshStatus", (type: string, userId: string) => {
      if ((type === "logOut") && (userId === userData.id)) return;
      dispatch(setRefreshConvos(!refreshConvos))
      setRefreshStatus(!refreshStatus);
    });

    socket?.on("refresh", (channelStatus: string, channelName: string) => {
      setRefresh(!refresh);
      dispatch(setRefreshConvos(!refreshConvos))
      if (channelStatus && channelName === groupData.name) toast.success(`This channel has been set to ${channelStatus}`)
    });

    socket?.on('getAllMessages', (data: any, roomId: string) => {
      if (roomId === props.params.id) {
        setMessages(data);
      }
    });

    socket?.on("refreshFrontfriendShip", (channelStatus: any) => {
      setRefreshNoifications(!refreshNotifs);
    });

    socket?.on("changePasswordResponse", (response: any) => {
      if (response.error) {
        toast.error(`Error: ${response.error.message}`);
      } else {
        toast.success("Password changed successfully");
      }
    });

    socket?.on("redirectToChatPage", (userId: string, roomName: string, roomId: string, type: string) => {
      if (userId === userData.id) {
        if (roomId === props.params.id)
          router.push('/Chat');
        toast.error(`You have been ${type} from ${roomName}`);
      }
    });

    socket?.on("refreshAllInFront", (myId: string) => {
      setRefreshStatus(!refreshStatus);
      dispatch(setRefreshConvos(!refreshConvos))
    });

    socket?.on("left",(myId:string) =>{
      router.push('/Chat');
      
      toast.success(`You left ${groupData.name}`)
      dispatch(setRefreshConvos(!refreshConvos))
    });

    socket?.on("alreadyUnmuted", (myId: string) => {
      if (myId === userData.id) {
        toast(`This user is already unmuted`);
      }
      setRefresh(!refresh);
    });

    return () => {
      socket?.off("left");
      socket?.off("refresh");
      socket?.off("refreshStatus");
      socket?.off("getAllMessages");
      socket?.off("refreshFrontfriendShip");
      socket?.off("redirectToChatPage");
      socket?.off("changePasswordResponse");
      socket?.off("alreadyUnmuted");
      socket?.off("refreshAllInFront");
    };
  });

  useEffect(() => {
    scrolToBottom?.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

  function sendMessage() {
    setMssage("");
    if (message) {
      socket?.emit("sendMessage", {
        message,
        roomId: groupData?.id,
        userId: userData.id,
        token: token
      });
    }
  };

  function enterKeyDown(key: string) {
    if (key == "Enter")
      sendMessage()
  };

  function checkIfUserMuted(userId: string) {
    return groupData?.mutedUsers.some((user:string) => user.split(" ")[0] === userId);
  }

  function checkIfAdmin(userId: string) {
    return groupData?.modes?.includes(userId);
  }

  function setToPublic() {
    socket?.emit("setRoomToPublic", {
      message: `announcement ${userData.username} has set this room to Public`,
      roomId: groupData?.id,
      userId: userData.id,
      token: token
    });
  }

  const setToProtected = async () => {

    try {
      if (!Password || (Password.length < 4 || Password.length > 16)) {
        toast.error("Error: Password must be between 4 and 16 characters");
        return;
      }
        const data = {
          message: `announcement ${userData.username} has set this room to Protected`,
          roomId: groupData?.id,
          userId: userData.id,
          password: Password,
          token: Cookies.get('JWT_TOKEN')
        };
      const response = await axios.post(`${url}/chat/setRoomToProtected`, data, { withCredentials: true });
      
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        toast.error(`Error: ${error.response.data.message}`, error.response.status);
        return;
      }
    }
    setPassword("");
    setChangePassword(!changePassword)
  }

  const ChangeRoomPassword = async () => {
    try {
      if (!Password || (Password.length < 4 || Password.length > 16)) {
        toast.error("Error: Password must be between 4 and 16 characters");
        return;
      }
        const data = {
          roomId: groupData?.id,
          password: Password
        };
      const response = await axios.post(`${url}/chat/changeRoomPassword`, data, { withCredentials: true });
      toast.success("The password have been changed successfully");

    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        toast.error(`Error: ${error.response.data.message}`, error.response.status);
        return;
      }
    }
    setPassword("");
    setChangePassword(!changePassword)
  }

  function leave() {
    socket?.emit("leave", {
      message: "",
      roomId: groupData?.id,
      userId: userData.id,
      username: userData.username,
      token: token
    });
  }
  
const Play = async (tar:any):Promise<void> => 
  {
    await axios.post(`${url}/user/sendPlayAgain`,{ sender: userData.id, target:tar}, { withCredentials: true });

    const socket = io(`${url}`, {
      path: '/play',
      query: {
        token: "token_data",
        id: userData.id,
        tar: tar
      }
    });

    // router.push({
    //   pathname: '/Play',
    //   query: { tar: tar, },
    // });

    socket.emit('accepted_request', { key: userData.id, value: tar });
  }

  useEffect(() => {
    const sendPlayRequest = async () => {
      if (clicked) {
        try {
          await axios.post(`${url}/game/sendPlayRequest`, { sender: userData.id, target: groupData.members[0].id}, { withCredentials: true } );
          setIsclicked(false);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };
    sendPlayRequest();
  }, [clicked]);


  // const inviteToPlay = async (target:string) => {
  //   try {
  //     axios.post(
  //       `http://localhost:4000/game/accept`, { myId: userData.id, target }, { withCredentials: true } );
  //     setRefreshNoifications(!refreshNotifs);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //   }
  // };


  // if(groupData === 404){
  //   return <NotUser />
  // }

  return (

    groupData === 404 ?
      <NotUser />
      : ((groupData.type === "DM" && isLoading) ?

        (
          <div className='h-screen w-full flex flex-1 relative z-10'>
            <div className='w-full h-full relative'>
              <div className='header flex items-center h-[130px] border-b-[2px] bg-opacity-[50%] relative pl-14 md:pl-2'>
                <div className='z-10 relative'><img className={`min-w-[50px] max-w-[50px] h-[50px] rounded-[25px] mr-3`} src={`${groupData.avatar}`} alt={`${groupData.avatar}`} />
                  <div className={`absolute w-[10px] h-[10px] ${groupData.members[0].status === "Online" ? "bg-green-700" : groupData.members[0].status === "inGame" ? "bg-red-600" : "bg-gray-600"} rounded-full right-[17%] top-2`}></div>
                </div>
                <div className='text-[40px] font-sans-only text-[#2E2E2E] opacity-[76%]'>{groupData.name}</div>
                <button className='flex items-center justify-center absolute rounded-[20px] active:bg-[#c2c2c2] right-8 p-4 h-[50px] w-[50px]' onClick={() => setDMsSettings(!DMsSettings)}> <img className='w-[33px] h-[33px] ' src="/3no9at.svg" alt="/3no9at.svg" /> </button>
                {DMsSettings &&
                  <>
                    {(blockType !== "friends") ?
                      <div className='rounded-[20px] w-[200px] h-[70px] top-[90px] right-8 absolute mr-[10px] flex flex-col items-center justify-evenly border-[1px] bg-white'>
                        <Link href={`/Profile/${groupData.members[0].id}`} className='font-normal text-[22px] hover:text-[#7583b9] text-[#4e5c95] font-sans-only flex justify-center items-center hover:border-l hover:border-r border-white rounded-tr-[20px] rounded-tl-[20px] gap-[10px]'> visit profile </Link>
                      </div>
                      :
                      (
                        <div className='rounded-[20px] w-[200px] h-[140px] top-[90px] right-8 absolute mr-[10px] flex flex-col items-center justify-evenly border-[1px] bg-white'>
                          <Link href={`/Play/${groupData.members[0].id}`} >
                            <button className='font-normal text-[22px] hover:text-[#7583b9] text-[#4e5c95] font-sans-only flex justify-center items-center hover:border-l hover:border-r border-white rounded-tr-[20px] rounded-tl-[20px] gap-[10px] ' onClick={() => Play(groupData.members[0].id)}>Invite to Play</button>
                          </Link>
                          <Link href={`/Profile/${groupData.members[0].id}`} className='font-normal text-[22px] hover:text-[#7583b9] text-[#4e5c95] font-sans-only flex justify-center items-center hover:border-l hover:border-r border-white rounded-tr-[20px] rounded-tl-[20px] gap-[10px]'> visit profile </Link>
                        </div>
                      )
                    }
                  </>
                }
              </div>


              <div className='chatHeight overflow-hidden overflow-y-visible overflow-x-hidden no-scrollbar mt-[20px] '>
                <div className='flex flex-col'>
                  {messages?.map((message, index) => (
                    <div key={index} className='flex w-full'>

                      {(message.userId === userData.id) &&
                        (userData.id !== messages[index - 1]?.userId ?
                          <div className='w-full mt-[30px]'>
                            {message.content.startsWith('announcement') ?
                              <div className='flex items-center justify-center w-full'>
                                <div key={message.id} className='bg-[#495791] text-white mb-4 mt-4 rounded-b-[24px] rounded-t-[24px] w-fit font-normal text-[14px] font-sans-only break-all p-[6px] px-4'>
                                  {message.content.slice('announcement'.length + 1)}
                                </div>
                              </div>
                              :
                              <div className='w-full flex justify-end items-end'>
                                <div className='flex flex-col items-end pr-[16px] justify-end w-[100%] md:w-[80%] lg:w-fit lg:max-w-[50%]  mb-1'>
                                  <div key={message.id} className='rounded-b-[24px] rounded-tl-[24px] w-fit font-normal text-[18px] font-sans-only break-all bg-gray-100 p-[16px] lg:min-w-[100%] max-w-[70%]'>{message.content}  </div>
                                </div>
                              </div>
                            }
                          </div>
                          :
                          <div className='w-full'>
                            {message.content.startsWith('announcement') ?
                              <div className='flex items-center justify-center w-full'>
                                <div key={message.id} className='bg-[#495791] text-white mb-4 mt-4 rounded-b-[24px] rounded-t-[24px] w-fit font-normal text-[14px] font-sans-only break-all p-[6px] px-4'>
                                  {message.content.slice('announcement'.length + 1)}
                                </div>
                              </div>

                              :
                              <div className='w-full flex justify-end items-end'>
                                <div className='flex flex-col items-end pr-[16px] justify-end w-[100%] md:w-[80%] lg:w-fit lg:max-w-[50%]  mb-1'>
                                  <div key={message.id} className='rounded-b-[24px] rounded-tl-[24px] w-fit font-normal text-[18px] font-sans-only break-all bg-gray-100 p-[16px] lg:min-w-[100%] max-w-[70%]'>{message.content}  </div>
                                </div>
                              </div>
                            }
                          </div>
                        )
                      }
                      {(message.userId !== userData.id) &&
                        (message.content.startsWith('announcement') ?
                          <div className='flex items-center justify-center w-full '>
                            <div key={message.id} className='bg-[#495791] text-white mb-4 mt-4 rounded-b-[24px] rounded-t-[24px] w-fit font-normal text-[14px] font-sans-only break-all p-[6px] px-4'>
                              {message.content.slice('announcement'.length + 1)}
                            </div>
                          </div>
                          :
                          <div className='flex items-end pl-[16px] pb-[4px] gap-[16px] md:w-[70%] lg:w-[50%]'>
                            {index > 0 && ((message.userId === messages[index - 1].userId) && (!messages[index - 1].content.startsWith('announcement'))) ?
                              <div key={message.id} className='ml-[62px] rounded-b-[24px] rounded-tr-[24px] w-fit font-normal text-[18px] font-sans-only break-all bg-gray-100 p-[16px] lg:max-w-[100%] max-w-[70%]'> {message.content} </div>
                              : <div className='mt-7 border-black flex'>
                                <div className='h-[50px] min-w-[50px] border-[1px] rounded-[25px]  mr-[10px] overflow-hidden'> <img className='object-cover h-[50px] min-w-[50px] max-w-[50px]  ' src={`${message?.sender?.avatar}`} alt="" /></div>
                                <div className='rounded-tr-[24px] rounded-b-[24px]  '>
                                  <div className='flex h-[45px]'>
                                    <div className='text-[21px] font-bold text-teal-700 break-all ' >{message?.sender?.username}</div>
                                    {(groupData.owner == message.userId) && <div className='ml-2 mt-1 rounded-[9px] font-light text-white  h-fit px-2 py-[2px] bg-[#d33939]' >owner</div>}
                                    {(checkIfAdmin(message.userId)) && <div className='ml-2 mt-1 rounded-[9px] font-light text-white  h-fit px-2 py-[2px] bg-[#7239D3]' >admin</div>}
                                  </div>
                                  <div key={message.id} className='rounded-b-[24px] rounded-tr-[24px] w-fit font-normal text-[18px] font-sans-only break-all bg-gray-100 p-[16px] lg:w-fit lg:max-w-[100%] md:max-w-[83%] max-w-[75%]'>{message.content}</div>
                                </div>
                              </div>
                            }
                          </div>
                        )
                      }
                    </div>
                  ))}
                  <div ref={scrolToBottom} />

                </div>



                {(blockType === "friends") ?
                  (
                    <div className='sendBox flex justify-between items-center w-full h-[100px] absolute bottom-0 border-t-[2px] bg-opacity-[52%] overflow-hidden'>
                      <div className='w-[100%]'><input className='send w-[99%] h-[55px] pl-[20px] rounded-[10px] ml-[10px] bg-gray-200  bg-opacity-[45%]' type="search" placeholder='Type your message here' value={message} onChange={(e) => setMssage(e.target.value)} onKeyDown={(e) => enterKeyDown(e.key)} /></div>
                      <div className='flex justify-center w-[50px] h-[50px] bg-[#000000] bg-opacity-[24%] mr-[10px] ml-[10px] rounded-[25px]'> <button className='mr-[4px]'> <img src="/send.svg" alt="/send.svg" onClick={sendMessage} /> </button> </div>
                    </div>
                  )
                  : (blockType === "blockedBy") ?
                    (
                      <div className='sendBox flex justify-center items-center w-full h-[100px] absolute bottom-0 border-t-[2px] bg-opacity-[52%] overflow-hidden'>
                        <div className='w-[96%]'><input className='send w-[100%] h-[55px] pl-[20px] rounded-[10px] bg-gray-200  bg-opacity-[45%] cursor-not-allowed outline-none' type="search" placeholder='You are blocked by this user' readOnly value={message} /></div>
                      </div>
                    )
                    : (blockType === "blockedUser") ?
                      (
                        <div className='sendBox flex justify-center items-center w-full h-[100px] absolute bottom-0 border-t-[2px] bg-opacity-[52%] overflow-hidden'>
                          <div className='w-[96%]'><input className='send w-[100%] h-[55px] pl-[20px] rounded-[10px] bg-gray-200  bg-opacity-[45%] cursor-not-allowed outline-none' type="search" placeholder='You blocked this user' readOnly value={message} /></div>
                        </div>
                      )
                      :
                      (
                        <div className='sendBox flex justify-center items-center w-full h-[100px] absolute bottom-0 border-t-[2px] bg-opacity-[52%] overflow-hidden'>
                          <div className='w-[96%]'><input className='send w-[100%] h-[55px] pl-[20px] rounded-[10px] bg-gray-200  bg-opacity-[45%] cursor-not-allowed outline-none' type="search" placeholder='You are not friend with this user anymore' readOnly value={message} /></div>
                        </div>
                      )
                }
              </div>
            </div>
          </div>
        )
        :
        (

          <div className='h-screen w-full flex flex-1 relative z-10'>
            <div className='w-full h-full relative'>
              <div className='header flex items-center h-[130px] border-b-[2px] bg-opacity-[50%] pl-14 md:pl-2'>
                <div> <img className='h-[90px] w-[90px] ml-1 mr-3 rounded-[50px] object-fill' src={`http://localhost:4000/${groupData.avatar}`} alt={`http://localhost:4000/${groupData.avatar}`} /></div>
                <div className='text-[40px] font-sans-only text-[#2E2E2E] opacity-[76%]'>{groupData.name}</div>
              </div>

              <div className='chatHeight overflow-hidden overflow-y-visible overflow-x-hidden no-scrollbar mt-[20px] '>
                <div className='flex flex-col'>
                  {messages?.map((message, index) => (
                    <div key={index} className='flex w-full'>
                      {!myBlockList?.some((userid: string) => userid === message.userId) ? (
                        <>
                          {(message.userId === userData.id) &&
                            (userData.id !== messages[index - 1]?.userId ?
                              <div className='w-full mt-[30px]'>
                                {message.content.startsWith('announcement') ?
                                  <div className='flex items-center justify-center w-full'>
                                    <div key={message.id} className='bg-[#495791] text-white mb-4 mt-4 rounded-b-[24px] rounded-t-[24px] w-fit font-normal text-[14px] font-sans-only break-all p-[6px] px-4'>
                                      {message.content.slice('announcement'.length + 1)}
                                    </div>
                                  </div>
                                  :
                                  <div className='w-full flex justify-end items-end'>
                                    <div className='flex flex-col items-end pr-[16px] justify-end w-[100%] md:w-[80%] lg:w-fit lg:max-w-[50%]  mb-1'>
                                      <div key={message.id} className='rounded-b-[24px] rounded-tl-[24px] w-fit font-normal text-[18px] font-sans-only break-all bg-gray-100 p-[16px] lg:min-w-[100%] max-w-[70%]'>{message.content}  </div>
                                    </div>
                                  </div>
                                }
                              </div>
                              :
                              <div className='w-full'>
                                {message.content.startsWith('announcement') ?
                                  <div className='flex items-center justify-center w-full'>
                                    <div key={message.id} className='bg-[#495791] text-white mb-4 mt-4 rounded-b-[24px] rounded-t-[24px] w-fit font-normal text-[14px] font-sans-only break-all p-[6px] px-4'>
                                      {message.content.slice('announcement'.length + 1)}
                                    </div>
                                  </div>

                                  :
                                  <div className='w-full flex justify-end items-end'>
                                    <div className='flex flex-col items-end pr-[16px] justify-end w-[100%] md:w-[80%] lg:w-fit lg:max-w-[50%]  mb-1'>
                                      <div key={message.id} className='rounded-b-[24px] rounded-tl-[24px] w-fit font-normal text-[18px] font-sans-only break-all bg-gray-100 p-[16px] lg:min-w-[100%] max-w-[70%]'>{message.content}  </div>
                                    </div>
                                  </div>
                                }
                              </div>
                            )
                          }
                          {(message.userId !== userData.id) &&
                            (message.content.startsWith('announcement') ?
                              <div className='flex items-center justify-center w-full'>
                                <div key={message.id} className='bg-[#495791] text-white mb-4 mt-4 rounded-b-[24px] rounded-t-[24px] w-fit font-normal text-[14px] font-sans-only break-all p-[6px] px-4'>
                                  {message.content.slice('announcement'.length + 1)}
                                </div>
                              </div>
                              :
                              <div className='flex items-end pl-[16px] pb-[4px] gap-[16px] md:w-[70%] lg:w-[50%]'>
                                {index > 0 && ((message.userId === messages[index - 1].userId) && (!messages[index - 1].content.startsWith('announcement'))) ?
                                  <div key={message.id} className='ml-[62px] rounded-b-[24px] rounded-tr-[24px] w-fit font-normal text-[18px] font-sans-only break-all bg-gray-100 p-[16px] lg:max-w-[100%] max-w-[70%]'> {message.content} </div>
                                  : <div className='mt-7 border-black flex'>
                                    <div className='h-[50px] min-w-[50px] border-[1px] rounded-[25px]  mr-[10px] overflow-hidden'> <img className='object-cover h-[50px] min-w-[50px] max-w-[50px]  ' src={`${message?.sender?.avatar}`} alt="" /></div>
                                    <div className='rounded-tr-[24px] rounded-b-[24px]  '>
                                      <div className='flex h-[45px]'>
                                        <div className='text-[21px] font-bold text-teal-700 break-all ' >{message?.sender?.username}</div>
                                        {(groupData.owner == message.userId) && <div className='ml-2 mt-1 rounded-[9px] font-light text-white  h-fit px-2 py-[2px] bg-[#d33939]' >owner</div>}
                                        {(checkIfAdmin(message.userId)) && <div className='ml-2 mt-1 rounded-[9px] font-light text-white  h-fit px-2 py-[2px] bg-[#7239D3]' >admin</div>}
                                      </div>
                                      <div key={message.id} className='rounded-b-[24px] rounded-tr-[24px] w-fit font-normal text-[18px] font-sans-only break-all bg-gray-100 p-[16px] lg:w-fit lg:max-w-[100%] md:max-w-[83%] max-w-[75%]'>{message.content}</div>
                                    </div>
                                  </div>
                                }
                              </div>
                            )
                          }
                        </>
                      )
                        : null
                      }

                    </div>

                  ))}
                  <div ref={scrolToBottom} />
                </div>
                <div className='sendBox flex justify-between items-center w-full h-[100px] absolute bottom-0 border-t-[2px] bg-opacity-[52%] overflow-hidden'>
                  <div className='w-[100%]'><input className='send w-[99%] h-[55px] pl-[20px] rounded-[10px] ml-[10px] bg-gray-200  bg-opacity-[45%]' type="search" placeholder='Type your message here' value={message} onChange={(e) => setMssage(e.target.value)} onKeyDown={(e) => enterKeyDown(e.key)} /></div>
                  <div className='flex justify-center w-[50px] h-[50px] bg-[#000000] bg-opacity-[24%] mr-[10px] ml-[10px] rounded-[25px]'> <button className='mr-[4px]'> <img src="/send.svg" alt="/send.svg" onClick={sendMessage} /> </button> </div>
                </div>
              </div>
            </div>




            <div className="flex overflow-y-auto overflow-x-hidden no-scrollbar">
              <input type="checkbox" id="drawer-toggle" className="relative sr-only peer" onChange={() => { setChangePassword(false); handleToggleSettings(null); setRefresh(!refresh) }} />
              <label
                htmlFor="drawer-toggle"
                className="absolute top-[50px] right-3 bg-red-600 pl-11 transition-all duration-500 rounded-lg z-30 peer-checked:rotate-180 peer-checked:right-[390px] peer-checked:top-[80px]">
                <img src="/leftArrow.svg" alt="/leftArrow.svg" className='w-[30px] h-[30px] absolute right-0' />
              </label>

              <div className="fixed top-0 right-0 z-20 w-full backdrop-blur-[8px] h-full transition-all duration-500 transform translate-x-full shadow-lg peer-checked:translate-x-0">
                <div className="flex absolute right-0 px-6 py-4 w-[400px] border-l-[1px] h-full bg-[#eff5ff]">
                  <div className='flex flex-1 flex-col items-center  backdrop-blur-sm '>
                    <div> <img className=' h-[150px] w-[150px] rounded-[50%] mt-[100px]' src={`http://localhost:4000/${groupData?.avatar}`} alt={`http://localhost:4000/${groupData?.avatar}`} /></div>
                    <div className='font-normal text-[40px] font-sans-only text-[#2E2E2E] mb-9'>{groupData?.name}</div>
                    <div className='flex flex-col h-[100%] relative w-[100%] gap-8'>
                      <div className='flex flex-col max-h-[30%] bg-[#e6ebfe] rounded-[13px] pb-4 hover:bg-[#d6dbed] transition-all duration-500 h-[400px]'>
                        <div className='flex p-4 py-5 gap-2 font-bold'> <img className='h-[24px] w-[24px]' src="/creatg.svg" alt="/creatg.svg" />  Members </div>
                        <div className='rounded-t-[15px] rounded-b-[15px] px-3 bg-inherit flex flex-col gap-[2px] w-full no-scrollbar overflow-y-auto overflow-x-hidden h-full' >
                          {/* <div className='flex items-center gap-3 ml-6 pt-2'>
                    <img className='h-[40px] w-[40px] rounded-[25px] object-fill' src="addf.svg" alt="addf.svg" />
                    <div className='font-bold'> Add Members</div>
                  </div> */}
                          {/* ${members.status === "Online" ? "border-[3px] border-green-500" : "border-[3px] border-gray-500" */}
                          {(groupData?.members) && groupData?.members.map((members: any, index: any) => (
                            <div key={index} className='w-[100%] py-4 mb-1 mt-1 flex items-center justify-between bg-white max-w-[350px] px-4 rounded-[10px] relative '>
                              <div className='flex overflow-visible'>
                                <div className='z-10 relative'><img className={`min-w-[50px] max-w-[50px] h-[50px] rounded-[25px] mr-3`} src={`${members.avatar}`} alt={`${members.avatar}`} />
                                  <div className={`absolute w-[10px] h-[10px] ${members.status === "Online" ? "bg-green-700" : members.status === "inGame" ? "bg-red-600" : "bg-gray-600"} rounded-full right-[17%] top-2`}></div>
                                </div>
                                <div className='z-20'>
                                  <div className='font-bold'>{members.username}</div>
                                  {
                                    (groupData?.owner === members.id) ? (<div className='text-gray-400 text-[14px] self-start'>Owner</div>)
                                      : ((checkIfAdmin(members.id)) ? (<div className='text-gray-400 text-[14px] self-start'>Admin</div>)
                                        : null)
                                  }
                                </div>
                                {memberSettings[index] && (
                                  <>
                                    {checkIfAdmin(members.id) && (checkIfAdmin(userData.id) || (groupData?.owner === userData.id)) ?
                                      (
                                        <div className='font-semibold absolute right-12 top-4 bg-[#e6ebfe] flex flex-col border-[1px] rounded-[10px] p-1 z-[1000]'>
                                          {((groupData?.owner === userData.id) || (checkIfAdmin(userData.id))) ?
                                            <>
                                              {checkIfUserMuted(groupData?.members[index].id) ?
                                                <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("unmute", groupData?.members[index], index, "") }}>unmute</div>
                                                :
                                                <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("mute", groupData?.members[index], index, "60") }}>mute for 1m</div>
                                              }
                                              <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("kick", groupData?.members[index], index, "") }}>kick</div>
                                              <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("ban", groupData?.members[index], index, "") }}>ban</div>
                                              {groupData?.owner === userData.id && (
                                                checkIfAdmin(groupData?.members[index].id) ?
                                                  <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("removeAdmin", groupData?.members[index], index, "") }}>remove admin</div>
                                                  :
                                                  <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("makeAdmin", groupData?.members[index], index, "") }}>make admin</div>
                                              )
                                              }
                                              <Link href={`/Profile/${members.id}`} className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]'> visit profile </Link>
                                            </>
                                            :
                                            <>
                                              <Link href={`/Profile/${members.id}`} className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]'> visit profile </Link>
                                            </>
                                          }
                                        </div>

                                      )
                                      : groupData?.owner === members.id ?
                                        (
                                          <div className='font-semibold absolute right-12 top-4 bg-[#e6ebfe] flex flex-col border-[1px] rounded-[10px] p-1 z-[1000]'>
                                            <Link href={`/Profile/${members.id}`} className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]'> visit profile </Link>
                                          </div>
                                        )
                                        :
                                        <div className='font-semibold absolute right-12 top-4 z-50 bg-[#e6ebfe] flex flex-col border-[1px] rounded-[10px] p-1 '>
                                          {((groupData.owner === userData.id) || (checkIfAdmin(userData.id))) ?
                                            <>
                                              {checkIfUserMuted(groupData.members[index].id) ?
                                                <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("unmute", groupData.members[index], index, "") }}>unmute</div>
                                                :
                                                <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("mute", groupData?.members[index], index, "60") }}>mute for 1m</div>
                                              }
                                              <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("kick", groupData.members[index], index, "") }}>kick</div>
                                              <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("ban", groupData?.members[index], index, "") }}>ban</div>
                                              {checkIfAdmin(groupData.members[index].id) ?
                                                <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("removeAdmin", groupData.members[index], index, "") }}>remove admin</div>
                                                :
                                                <div className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' onClick={() => { handleChannelCommands("makeAdmin", groupData.members[index], index, "") }}>make admin</div>
                                              }
                                              <Link href={`/Profile/${members.id}`} className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' > visit profile </Link>
                                            </>
                                            :
                                            <>
                                              <Link href={`/Profile/${members.id}`} className='hover:text-[#8d94af] cursor-pointer py-2 px-2 rounded-[8px]' > visit profile </Link>
                                            </>
                                          }
                                        </div>
                                    }
                                  </>
                                )}
                              </div>
                              {(members.id !== userData.id) &&
                                <button onClick={() => handleToggleSettings(index)}> <img className='w-[20px] h-[20px] ' src="/3no9at.svg" alt="/3no9at.svg" /></button>
                              }
                            </div>
                          ))}
                        </div>
                      </div>
                      {(groupData?.status !== "Private") &&
                        <div className='flex flex-col gap-4 bg-[#e6ebfe] hover:bg-[#d6dbed] transition-all duration-500 p-4 rounded-[13px]'>
                          <div className='flex gap-2 items-center'>
                            <img className='h-[24px] w-[24px]' src="/lock.svg" alt="/lock.svg" />
                            <div>
                              <button className='flex gap-1 font-bold ' >Group Type</button>
                              <div className='text-gray-500 text-[12px]'>{groupData?.status}</div>
                            </div>
                          </div>
                          {groupData?.owner && (checkIfAdmin(userData.id) || userData.id === groupData.owner) && (

                            <div className='rounded-t-[15px] rounded-b-[15px] p-3 bg-white flex flex-col w-full'>
                              {(groupData?.status === "Protected") ?
                                (
                                  <div className='flex flex-col items-start gap-2'>
                                    <button className='w-full p-2 bg-[#495791] rounded-[10px] font-semibold text-white hover:bg-[#313d6c] transition-all duration-500' onClick={() => setChangePassword(!changePassword)}>Change Password</button>
                                    {changePassword && (
                                      <div className='w-full flex flex-col gap-2 border-[1px] p-3 rounded-[13px]'>
                                        <input className='searchBar w-[100%] h-[45px] pl-5 rounded-xl bg-gray-200 ' type="text" placeholder="Change Password" onChange={(e) => setPassword(e.target.value)} />
                                        <div className='self-end'>
                                          <button className='bg-[#495791]  text-white border-[1px] p-2 text-[16px] w-[80px] mt-2 rounded-[13px] font-medium hover:bg-[#313d6c] transition-all duration-500' onClick={ChangeRoomPassword}>save</button>
                                          <button className='bg-[#495791]  text-white border-[1px] p-2 text-[16px] w-[80px] mt-2 rounded-[13px] font-medium hover:bg-[#313d6c] transition-all duration-500' onClick={() => setChangePassword(!changePassword)}>cancel</button>
                                        </div>
                                      </div>
                                    )}
                                    <button className='w-full p-2 bg-gray-200 text-[#495791] rounded-[10px] font-semibold hover:bg-gray-300 transition-all duration-500' onClick={() => setToPublic()}>Set To Public</button>
                                  </div>
                                ) : (
                                  <div className='flex flex-col items-start gap-2'>
                                    <button className='w-full p-2 bg-[#495791] rounded-[10px] font-semibold text-white hover:bg-[#313d6c] transition-all duration-500' onClick={() => setChangePassword(!changePassword)}>Set Password</button>
                                    {changePassword && (
                                      <div className='w-full flex flex-col'>
                                        <input className='searchBar w-[100%] h-[45px] pl-5 rounded-xl bg-gray-200 ' type="text" placeholder="Set Password" onChange={(e) => setPassword(e.target.value)} />
                                        <div className='self-end flex gap-1'>
                                          <button className='bg-[#495791] text-white border-[1px] p-2 text-[16px] w-[80px] mt-2 rounded-[13px] font-medium hover:bg-[#313d6c] transition-all duration-500' onClick={setToProtected}>save</button>
                                          <button className='bg-[#495791] text-white border-[1px] p-2 text-[16px] w-[80px] mt-2 rounded-[13px] font-medium hover:bg-[#313d6c] transition-all duration-500' onClick={() => setChangePassword(!changePassword)}>cancel</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      }
                    </div>
                  </div>
                </div>
                <div className='absolute bottom-10 right-4 bg-[#D1483E] hover:bg-red-700 rounded-[10px] transition-all duration-500'>
                  <div className='flex px-4'>
                    <img src="/leave.svg" alt="/leave.svg" />
                    <button className='p-3 font-bold text-white' onClick={leave}> Leave Group Chat</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        )
      )
  )
}
