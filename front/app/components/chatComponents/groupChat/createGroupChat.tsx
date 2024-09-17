import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setCreateGroup } from '@/redux/features/chatSlices/create_join_GroupSlice';
import { selectProfileInfo } from '@/redux/features/profile/profileSlice';
import { RootState } from '@/redux/store/store';
import FreindInfo from '../../profile/friends/FreindInfo';
import { toast } from 'sonner';
import Cookies from "js-cookie";

const token = Cookies.get("JWT_TOKEN");
export default function createGroupChat(props: any) {
  const [passWord, setPassWord] = useState("hidden");
  const [showAddMembers, setShowAddMembers] = useState("hidden");
  const [status, setStatus] = useState(false);
  const [channelStatus, setChannelStatus] = useState("");
  const [addMembers, setAddMembers] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelPassWord, setChannelPassWord] = useState<string>();
  const [photoPath, setPhotoPath] = useState<any>();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [friendsList, setFriendsList] = useState<any>();
  const [addingToPrivateRoomList, setAddingToPrivateRoomList] = useState<any>([]);
  const [backEndImagePath, setBackEndImagePath] = useState<string>();

  const dispatch = useDispatch();
  const userData = useSelector(selectProfileInfo);
  const socket = useSelector((state: RootState) => state.socket.socket);


  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  useEffect(() => {
    const getFriendsList = async () => {
      try {
        const myFriends = await axios.get(`${url}/user/userFreinds?userId=${userData.id}`, { withCredentials: true });
        setFriendsList(myFriends.data)
      }
      catch (error:any) {
      }
    };

    getFriendsList();
  }, []);

  const addGroupChat = async () => {
    if (!channelStatus) {
      toast.error("Error: Channel Status must be set"); 
      return
    }
    if (channelStatus === "Private") {
      try {
        if (avatar) {
          const formData = new FormData();
          formData.append('file', avatar);
          const backEndImagePath = await axios.post(`${url}/chat/uploads`, formData, { withCredentials: true });

          if ((channelName.trim().length < 4 || channelName.trim().length > 20)) {
            toast.error("Error: Channel name must be between 4 and 20 characters");
            return
          }

          const groupChatInfo = {
            name: channelName,
            avatar: backEndImagePath.data,
            status: "Private",
            owner: userData.id,
            addingToPrivateRoomList
          };
          const response = await axios.post(`${url}/chat/addToPrivateRoom`, groupChatInfo, { withCredentials: true });
          socket.emit("joinGroupChat", { userId: userData.id, groupId: response.data.id, token: token });
        }
        else {
          toast.error("Error: You must set the channel picture");
          return
        }
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          toast.error(`Error: ${error.response.data.message}`, error.response.status);
          return;
        }
      }
    }

    else {
      try {
        if (avatar) {
          const formData = new FormData();
          formData.append('file', avatar);
          const backEndImagePath = await axios.post(`${url}/chat/uploads`, formData, { withCredentials: true });

          if (!channelName || (channelName.trim().length < 4 || channelName.trim().length > 20)) {
            toast.error("Error: Channel name must be between 4 and 20 characters");
            return
          }
          if (channelStatus === "Protected" && !channelPassWord) {
            toast.error("Error: Protected Channel must have a password"); 
            return;
          }
          if (channelStatus === "Protected" && channelPassWord && (channelPassWord.length < 4 || channelPassWord.length > 16)) {
            toast.error("Error: Password must be between 4 and 16 characters"); 
            return;
          }

          const groupChatInfo = {
            name: channelName,
            avatar: backEndImagePath.data,
            status: channelStatus,
            password: channelPassWord,
            owner: userData.id
          };
          const response = await axios.post(`${url}/chat/createGroup`, groupChatInfo, { withCredentials: true });
          socket.emit("joinGroupChat", { userId: userData.id, groupId: response.data.id, token: token });
        }
        else {
          toast.error("Error: You must set the channel picture");
          return;
        }

      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          toast.error(`Error: ${error.response.data.message}`, error.response.status);
          return;
        }
      }
    }

    setChannelPassWord("");
    setChannelName("");
    setPassWord("hidden");

    dispatch(setCreateGroup(false));
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoPath(URL.createObjectURL(file));
      setAvatar(file);
    }
  };

  const addUserToPrivateRoom = async (userId: string) => {
    if (!addingToPrivateRoomList.includes(userId)) {
      setAddingToPrivateRoomList([...addingToPrivateRoomList, userId]);
    }
  }

  return (
    <div className='fixed h-full w-full left-0 top-0 bg-[#000000] bg-opacity-80 z-20'>
      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[20px] w-[70%] h-[70%] bg-[#6e7aaa]  overflow-hidden'>
        <div className='top-0 right-0 rounded-[50px] object-fill absolute'> <img src={"/shape1.svg"} alt="./shape1.svg" /></div>
        <div className='left-0 bottom-0 rounded-[50px] object-fill absolute'> <img src={"/shape2.svg"} alt="/shape2.svg" /></div>
        <div className='flex justify-center  w-[100%] h-[100%] items-center overflow-hidden '>
          <div className='absolute top-[26px] left-[34px] text-[#D7D7D7] text-[34px] font-bold'>Create New Channel</div>
          <div className='absolute mt-[10px] top-[91px] w-[100%] border-[1px] border-color1'></div>
          <div className='h-[70%] w-[80%] flex justify-around flex-col z-40'>
            <div className='flex justify-between w-[100%] items-center'>
              <div className='text-[#d7d7d7] myfont text-[29px]'>Channel Profile Picture</div>
              <div className='h-[100px] w-[100px] rounded-[50px] border-[1px] border-color1 flex items-center justify-center relative bg-slate-600 group'>
                <img className='h-[100px] w-[100px] rounded-[50px] border-[1px] border-color1 absolute object-cover' src={photoPath} alt='' />
                <input className='h-[100px] w-[100px] rounded-[50px] absolute opacity-0 z-10 cursor-pointer'
                  accept="image/*"
                  onChange={handleFileChange} type="file" />
                <div className='h-[100px] w-[100px] rounded-[50px] absolute hidden group-hover:flex items-center justify-center text-center bg-slate-600/50 text-white tracking-wider'>Selected Profile</div>
              </div>
            </div>

            <div className='flex justify-between w-[100%] '>
              <div className='text-[#d7d7d7] myfont text-[29px] '>Channel Name:</div>
              <div className='self-center font-serif text-[20px] '> <input className='text-[#D7D7D7] bg-opacity-[50%] pl-3 border-[1px] h-[57px] w-[200px] rounded-[10px] border-color1 bg-[#6e7aad]' type="text" placeholder='Type the name here' onChange={(e) => setChannelName(e.target.value)} /> </div>
            </div>

            <div className='flex justify-between w-[100%]'>
              <div className='text-[#d7d7d7] myfont text-[29px]'>Channel Status</div>
              <div className='relative'>
                <button className='text-[#D7D7D7] hover:bg-[#5b648e] text-[20px] font-serif bg-opacity-[50%] h-[57px] w-[200px] border-[1px] rounded-[10px] border-color1 bg-[#6e7aad] relative' onClick={() => setStatus(!status)}>{channelStatus ? channelStatus : "Select Option"}</button>
                {status && (
                  <div className='absolute text-[#D7D7D7] text-[20px] font-serif mt-[6px] pt-4 pb-4 right-0 w-[200px] bg-[#5a6597]  border-[1px] border-color1 rounded-[16px]'>
                    <button className='hover:text-[#6e7aad] pl-2 pb-2 w-full flex' onClick={() => { setChannelStatus("Protected"); setStatus(false), setShowAddMembers("hidden"), setPassWord("") }}>Protected</button>
                    <button className='hover:text-[#6e7aad] pl-2 pb-2 w-full flex' onClick={() => { setChannelStatus("Private"); setStatus(false), setShowAddMembers(""), setPassWord("hidden") }}>Private</button>
                    <button className='hover:text-[#6e7aad] pl-2 w-full flex' onClick={() => { setChannelStatus("Public"); setStatus(false), setShowAddMembers("hidden"), setPassWord("hidden") }}>Public</button>
                  </div>
                )}
              </div>
            </div>

            <div className={`flex justify-between w-[100%] ${passWord}`}>
              <div className='text-[#d7d7d7] font-serif text-[29px]'>Channel password</div>
              <div className='self-center font-serif text-[20px] '> <input className='text-[#D7D7D7] bg-opacity-[50%] pl-1 border-[1px] h-[57px] w-[200px] rounded-[10px] border-color1 bg-[#6e7aad]' type="text" placeholder='Insert Your Password' onChange={(e) => setChannelPassWord(e.target.value)} /> </div>
            </div>

            <div className={`flex justify-between w-[100%] ${showAddMembers}`}>
              <div className='text-[#d7d7d7] myfont text-[29px]'>Channel Members</div>
              <button className='font-serif text-[20px] text-[#D7D7D7] bg-opacity-[50%] pl-3 border-[1px] h-[57px] w-[200px] rounded-[10px] border-color1 bg-[#6e7aad]' onClick={() => { setAddMembers(!addMembers) }}>Add Members</button>
              {addMembers && (
                <div className='fixed h-full w-full left-0 top-0 bg-[#000000] bg-opacity-80 z-50'>
                  <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[20px] w-[80%] h-[80%] border-[2px] border-black bg-[#6e7aaa] flex justify-center items-center'>
                    <div className='absolute top-[26px] left-[34px] text-[#D7D7D7] text-[34px] font-bold'>Add Users to Chat</div>
                    <div className='absolute mt-[10px] top-[91px] w-[100%] border-[1px] border-color1 '></div>

                    <div className='h-[50%] w-full flex justify-center items-center flex-col'>
                      {friendsList.map((friend: any) => (
                        <div className='flex flex-col justify-between sm:flex-row p-[16px] items-center mb-10 bg-[#9ca5cc] w-[60%] rounded-[34px] ' key={friend.id}>
                          <div className='flex justify-center items-center gap-[16px]'> <img className='h-[80px] w-[80px] ml-1 rounded-[50px] object-fill' src={`${friend.avatar}`} alt={friend.avatar} />
                            <div className='flex flex-col '>
                              <div className='text-[16px] text-[#252f5b font-sans-only test'> {friend.firstName} {friend.lastName}</div>
                              <div className='text-[14px] text-[#7d84a3] font-sans-only test'> {friend.username}</div>
                            </div>
                          </div>
                          <button className='w-[120px] h-[45px] hover:bg-[#4f587d] bg-[#6E7AAE] text-[#D7D7D7] rounded-[15px] ml-6' onClick={() => addUserToPrivateRoom(friend.id)} >Add</button>
                        </div>
                      ))}
                    </div>


                    <div className='absolute bottom-5 right-9 font-[IBM-Plex-Serif] font-thin flex items-center justify-center'>
                      <button className='w-[139px] h-[40px] bg-[#FFFFFF] hover:bg-[#efefef] bg-opacity-[41%] text-[20px] flex items-center justify-center rounded-[19px] opacity-[69%]' onClick={() => { setAddMembers(!addMembers) }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
          <div className='absolute bottom-5 right-9 font-[IBM-Plex-Serif] font-thin flex items-center justify-center'>
            <button className='w-[139px] h-[40px] text-[20px] bg-[#5a6597] hover:bg-[#47507c] text-[#D7D7D7] flex items-center justify-center rounded-[19px] mr-2' onClick={addGroupChat} >Create</button>
            <button className='w-[139px] h-[40px] bg-[#FFFFFF] hover:bg-[#efefef] bg-opacity-[41%] text-[20px] flex items-center justify-center rounded-[19px] opacity-[69%]' onClick={() => dispatch(setCreateGroup(false))}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}