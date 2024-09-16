import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selctedConversation } from '@/redux/features/chatSlices/selecConvoSlice';
import { selectProfileInfo } from '@/redux/features/profile/profileSlice';
import { RootState } from '@/redux/store/store';
import Link from 'next/link';

export default function Convos() {

  const socket = useSelector((state: RootState) => state.socket.socket);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(true);
  const [refreshStatus, setRefreshStatus] = useState(true);

  const refreshConvos = useSelector((state: RootState) => state.refresh.refresh);
  const userData = useSelector(selectProfileInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchChatGroups = async () => {
      try {
        console.log("aywaaaaaaaaa2")
        const response = await axios.get(`http://localhost:4000/chat/getGroupsByUserId?userId=${userData.id}`, { withCredentials: true });
        setMyGroups(response.data.data)
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchChatGroups();


  }, [refresh, socket, userData.id, refreshConvos, refreshStatus]);


  useEffect(() => {
    socket?.on("refresh", () => {
      setRefresh(!refresh);
    });
    socket?.on("refreshStatus", () => {
      setRefreshStatus(!refreshStatus);
    });
    socket?.on("refreshAllInFront",(myId:string) =>{
      setRefreshStatus(!refreshStatus);
    });
    return () => {
      socket?.off("refreshAllInFront");
      socket?.off("refreshStatus");
      socket?.off("refresh");
    };
  });

  return (
    <>
      {myGroups.map((myGroupChats: any, index:any) => (
        <React.Fragment key={index}>
          {myGroupChats.type === "DM" ?
            <button className='mr-[10px] mb-[10px] ml-[15px] rounded-[11px] w-[90%] border-[1px] p-2' key={myGroupChats.id} onClick={() => { dispatch(selctedConversation(myGroupChats.id)) }}>
              <Link href={`/Chat/${myGroupChats.id}`}>
                <div className='flex '>
                <div className='z-10 relative'><img className={`min-w-[50px] max-w-[50px] h-[50px] rounded-[25px] mr-3`} src={`${myGroupChats.avatar}`} alt={`${myGroupChats.avatar}`} />
                  <div className={`absolute w-[10px] h-[10px] ${myGroupChats.members[0].status === "Online" ? "bg-green-700" : myGroupChats.members[0].status === "inGame" ? "bg-red-600" : "bg-gray-600"} rounded-full right-[17%] top-2`}></div>
                </div>
                  <div className='pl-2 flex flex-col items-start'>
                    <div className='text-[20px] font-normal text-[#2e2e2e] font-sans-only test'> {myGroupChats.name}</div>
                    <div className='text-[11px] font-normal sans-serif text-[#2e2e2e]'>MESSAGEs</div>
                  </div>
                </div>
              </Link>
            </button>
            :
            <button className='mr-[10px] mb-[10px] ml-[15px] rounded-[11px] w-[90%] border-[1px] p-2' key={myGroupChats.id} onClick={() => { dispatch(selctedConversation(myGroupChats.id)) }}>
              <Link href={`/Chat/${myGroupChats.id}`}>
                <div className='flex '>
                  <div> <img className='h-[50px] w-[50px] ml-1 rounded-[25px] object-fill' src={`http://localhost:4000/${myGroupChats.avatar}`} alt={myGroupChats.avatar} /></div>
                  <div className='pl-2 flex flex-col items-start'>
                    <div className='text-[20px] font-normal text-[#2e2e2e] font-sans-only test'> {myGroupChats.name}</div>
                    <div className='text-[11px] font-normal sans-serif text-[#2e2e2e]'>MESSAGEs</div>
                  </div>
                </div>
              </Link>
            </button>
          }
        </React.Fragment>
      ))}
    </>
  )
}

