"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { selectProfileInfo } from '@/redux/features/profile/profileSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import Image from 'next/image';
import { io } from '@/../../node_modules/socket.io-client/build/esm/index';

export default function SearchPanel() {

  const dispatch = useDispatch();
  const myData = useSelector(selectProfileInfo);
  const socket = useSelector((state: RootState) => state.socket.socket);

  const [isClicked, setIsClicked] = useState(false)
  const [searchForUser, setSearchForUser] = useState("")
  const [allUsers, setAllUsers] = useState([])
  const [refreshNotifs, setRefreshNoifications] = useState<boolean>()
  const [myNotification, setMyNotifications] = useState<[]>();
  const [invitToPlay, setInvitToPlay] = useState<[]>();

  useEffect(() => {
    const getUsers = async (searchForUser: string) => {
      if (searchForUser.length > 0) {
        try {

          const response = await axios.get(`http://localhost:4000/user/getAllUsers?input=${searchForUser}`, { withCredentials: true });

          setAllUsers(response.data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };

    getUsers(searchForUser);
  }, [searchForUser]);

  useEffect(() => {
    const getMyNotifications = async () => {
      try {
        const notifications = await axios.get(`http://localhost:4000/user/getMyNotifications?userId=${myData.id}`, { withCredentials: true });
        setMyNotifications(notifications.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getMyNotifications();
  }, [refreshNotifs]);

  useEffect(() => {
    const getInviteToPlay = async () => {
      try {
        const notifications = await axios.get(`http://localhost:4000/user/getInviteToPlay?userId=${myData.id}`, { withCredentials: true });
        setInvitToPlay(notifications.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getInviteToPlay();
  }, [refreshNotifs]);

  useEffect(() => {
    socket?.on("refreshFrontNotifications", (channelStatus: any) => {
      setRefreshNoifications(!refreshNotifs);
    });
    return () => {
      socket?.off("refreshFrontNotifications");
    };
  });

  const acceptFriendRequest = async (notif: any) => {
    try {
      axios.post(`http://localhost:4000/user/acceptFriendRequest`, { notif, myId: myData.id }, { withCredentials: true });
      setRefreshNoifications(!refreshNotifs);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }


  const declineFriendRequest = async (notif: any) => {
    try {
      axios.post(`http://localhost:4000/user/declineFriendRequest`, { notif, myId: myData.id }, { withCredentials: true });
      setRefreshNoifications(!refreshNotifs);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }


  const acceptInvitToPlay = async (notif: any) => {
    try {
      await axios.post(`http://localhost:4000/user/acceptInviteToPlay`, { notif, myId: myData.id }, { withCredentials: true });
      setRefreshNoifications(!refreshNotifs);
      console.log("connected4")

      console.log("-------ach khassni anas",notif.senderId,notif.receiverId);
      const socket = io('http://localhost:4000', {
        path: '/play',
        query: {
          token: "token_d",
          tar: notif.senderId,
          send: notif.receiverId
        }
      });
      socket.emit("checker_y",notif.receiverId);
      socket.emit('accepted_request', { key: myData.id, value: notif.senderId });

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }


  const declineInvitToPlay = async (notif: any) => {
    try {
      axios.post(`http://localhost:4000/user/declineInviteToPlay`, { notif, myId: myData.id }, { withCredentials: true });
      setRefreshNoifications(!refreshNotifs);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }





  return (
    <div className='flex flex-row items-center justify-around sm:justify-around mt-14 w-[100%] relative '>
      <div className='searchBar w-6/12 md:w-[500px] '>
        <form className="w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <img src="../../../images/Research.svg" alt="searchicon" className="w-4 h-4" />
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-[100%] p-4 pl-10 text-sm text-gray-900 border  rounded-lg   outline-none vbg-[rgba(217, 217, 217, 0.38)] dark:placeholder-gray-400 dark:text-gray dark:focus:ring-black"
              placeholder="Search..."
              onChange={(e) => setSearchForUser(e.target.value)} />
          </div>
        </form>
        {searchForUser.length > 0 && (

          <div className='absolute h-[400px] w-6/12 md:w-[500px] rounded-lg bg-white z-[1000] p-4 border-[0.5px] border-[#dbe0f6] overflow-y-visible overflow-x-hidden no-scrollbar'>
            <div className='flex flex-col gap-4 w-full'>{allUsers?.map((user: any, index: any) => (
              <Link href={`/Profile/${user.id}`} key={index} >
                <div className='flex justify-start items-center  rounded-[14px]  bg-[#f3f5ff] hover:bg-[#e9edff] h-[90px] gap-2 p-2 md:p-4 cursor-pointer'>
                  <div className='min-h-[70px] min-w-[70px] relative'>
                    <Image
                      src={`${user.avatar}`}
                      alt={`${user.avatar}`}
                      fill={true}
                      className='rounded-full object-cover' />
                  </div>
                  <div>
                    <div className='font-semibold  text-[#252f5b] text-[12px] md:text-[16px]'>{user.firstName} {user.lastName}</div>
                    <div className="text-[10px] md:text-[14px] text-[#7d84a3]">{user.username}</div>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        )}
      </div>
      {/* ----------------------------------------------------------------------------------------------------------------------------- */}
      <div className='notifications relative bg-white p-2 rounded-lg'>
        <img src="../../../images/Bell.svg" alt="../../../images/Bell.svg" className='w-8 h-8' onClick={() => { setIsClicked(!isClicked); setRefreshNoifications(!refreshNotifs) }} />
        {isClicked && (
          <div className='mt-2 h-[400px] 2sm:w-[400px] sm:w-[500px] w-full bg-white absolute -right-4 sm:right-0 z-[1000] transition-all rounded-[10px] flex  items-center flex-col pt-5 gap-3 overflow-y-visible overflow-x-hidden no-scrollbar pb-5 border-[2px]'>
            {invitToPlay && invitToPlay.map((notif: any, index: any) =>
              <>
                {notif.status === "Pending" ? (
                  <>

                    {notif.receiverId === myData.id && (
                      <div key={index} className='flex w-[95%] h-[90px] sm:h-[80px] justify-between items-center rounded-[16px] bg-[#eef1ff]'>
                        <div className=' flex  p-3  gap-4' >
                          <div className='relative h-[50px] w-[50px]'>
                            <div className=' h-[50px] w-[50px] rounded-full overflow-hidden'>
                              <img className='h-full w-full object-cover' src={`${notif.sender.avatar}`} alt={`${notif.sender.avatar}`} />
                            </div>
                            {/* <div className='absolute top-0 -right-2 h-[20px] w-[20px] rounded-[12px] bg-[#7239D3]  flex items-center justify-center' >
                              <img className='h-[9px] w-[9px]' src="/Vector.svg" alt="/Vector.svg" />
                            </div> */}
                          </div>
                          <div className='flex flex-col '>
                            <div className='font-bold text-[#452975]'>Let's Play</div>
                            <div className='text-[15px]'>{notif.sender.firstName} {notif.sender.lastName}</div>
                          </div>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-1 pr-3'>
                          <Link href="../Play">
                            <button className='rounded-[8px] h-[28px] w-[84px] text-[14px] flex items-center justify-center text-white  font-semibold hover:scale-[1.05] transition-all duration-500 hover:bg-[#7449c0] bg-[#7239D3]' onClick={() => acceptInvitToPlay(notif)}>accept</button>
                          </Link>
                          <button className='rounded-[8px] h-[28px] w-[84px] text-[14px] flex items-center justify-center text-[#452b72]  font-semibold hover:scale-[1.05] transition-all duration-500 hover:bg-[#d9d8db]  bg-[#e5e2e9]' onClick={() => declineInvitToPlay(notif)}>decline</button>
                        </div>
                      </div>
                    )}
                  </>
                ) : false}
              </>
            )}
            {/* ----------------------------------------------------------------------------------------------------------------------------- */}

            {myNotification && myNotification.map((notif: any, index: any) =>
              <>
                {notif.status === "Pending" ? (
                  <>

                    {notif.receiverId === myData.id && (
                      <div key={index} className='flex w-[95%] h-[90px] sm:h-[80px] justify-between items-center rounded-[16px] bg-[#eef1ff]'>
                        <div className=' flex  p-3  gap-4' >
                          <div className='relative h-[50px] w-[50px]'>
                            <div className=' h-[50px] w-[50px] rounded-full overflow-hidden'>
                              <img className='h-full w-full object-cover' src={`${notif.sender.avatar}`} alt={`${notif.sender.avatar}`} />
                            </div>
                            <div className='absolute top-0 -right-2 h-[20px] w-[20px] rounded-[12px] bg-[#7239D3]  flex items-center justify-center' >
                              <img className='h-[9px] w-[9px]' src="/Vector.svg" alt="/Vector.svg" />
                            </div>
                          </div>
                          <div className='flex flex-col '>
                            <div className='font-bold text-[#452975]'>New friend request</div>
                            <div className='text-[15px]'>{notif.sender.firstName} {notif.sender.lastName}</div>
                          </div>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-1 pr-3'>
                          <button className='rounded-[8px] h-[28px] w-[84px] text-[14px] flex items-center justify-center text-white  font-semibold hover:scale-[1.05] transition-all duration-500 hover:bg-[#7449c0] bg-[#7239D3]' onClick={() => acceptFriendRequest(notif)}>accept</button>
                          <button className='rounded-[8px] h-[28px] w-[84px] text-[14px] flex items-center justify-center text-[#452b72]  font-semibold hover:scale-[1.05] transition-all duration-500 hover:bg-[#d9d8db]  bg-[#e5e2e9]' onClick={() => declineFriendRequest(notif)}>decline</button>
                        </div>
                      </div>
                    )}

                    {notif.senderId === myData.id && (
                      
                      <div key={index} className='flex w-[95%] h-[90px] sm:h-[80px] justify-between items-center rounded-[16px] bg-[#eef1ff]'>
                        <div className=' flex  p-3  gap-4' >
                          <div className='relative h-[50px] w-[50px]'>
                            <div className=' h-[50px] w-[50px] rounded-full overflow-hidden'>
                              <img className='h-full w-full object-cover' src={`${notif.receiver.avatar}`} alt={`${notif.receiver.avatar}`} />
                            </div>
                            <div className='absolute top-0 -right-2 h-[15px] w-[15px] rounded-[12px] bg-[#7239D3]  flex items-center justify-center' >
                              <img className='h-[6px] w-[6px]' src="/Vector.svg" alt="/Vector.svg" />
                            </div>
                          </div>
                          <div className='flex flex-col '>
                            <div className='font-bold text-[#452975]'>You sent Friend request to:</div>
                            <div className='text-[15px]'>{notif.receiver.firstName} {notif.receiver.lastName}</div>
                          </div>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-1 pr-3'>
                          <button className='rounded-[8px] h-[28px] w-[84px] text-[14px] flex items-center justify-center text-white  font-semibold hover:scale-[1.05] transition-all duration-500 hover:bg-[#7449c0] bg-[#7239D3]'>Pending...</button>
                        </div>
                      </div>
                    )}
                  </>
                )
                :
                notif.status === "Declined" ? (
                  
                  notif.senderId === myData.id && (
                    <>
                        <div key={index} className='flex w-[95%] h-[90px] sm:h-[80px] justify-between items-center rounded-[16px] bg-[#eef1ff]'>
                          <div className=' flex  p-3  gap-4' >
                            <div className='relative h-[50px] w-[50px]'>
                              <div className=' h-[50px] w-[50px] rounded-full overflow-hidden'>
                                <img className='h-full w-full object-cover' src={`${notif.receiver.avatar}`} alt={`${notif.receiver.avatar}`} />
                              </div>
                              <div className='absolute top-0 -right-2 h-[20px] w-[20px] rounded-[12px] bg-[#7239D3]  flex items-center justify-center' >
                                <img className='h-[9px] w-[9px]' src="/Vector.svg" alt="/Vector.svg" />
                              </div>
                            </div>
                            <div className='flex flex-col '>
                              <div className='font-bold text-[#452975]'>Your friend request has been Declined:</div>
                              <div className='text-[15px]'>{notif.receiver.firstName} {notif.receiver.lastName}</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                    
                    )
                    :
                    notif.status === "Accepted" && (
                      
                      notif.senderId === myData.id && (
                        <>
                          <div key={index} className='flex w-[95%] h-[90px] sm:h-[80px] justify-between items-center rounded-[16px] bg-[#eef1ff] relative'>
                            <div className=' flex  p-3  gap-4 ' >
                              <div className='relative h-[50px] w-[50px]'>
                                <div className=' h-[50px] w-[50px] rounded-full overflow-hidden'>
                                  <img className='h-full w-full object-cover' src={`${notif.receiver.avatar}`} alt={`${notif.receiver.avatar}`} />
                                </div>
                                <div className='absolute top-0 -right-2 h-[20px] w-[20px] rounded-[12px] bg-[#7239D3]  flex items-center justify-center' >
                                  <img className='h-[9px] w-[9px]' src="/Vector.svg" alt="/Vector.svg" />
                                </div>
                              </div>
                              <div className='flex flex-col '>
                                <div className='font-bold text-[#452975]'>You are now friends with:</div>
                                <div className='text-[15px]'>{notif.receiver.firstName} {notif.receiver.lastName}</div>
                              </div>
                            </div>
                            <div className='absolute right-2 bottom-1 flex flex-col text-[10px]'> {new Date(notif.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>

                          </div>
                        </>
                      )
                      
                      )
                    }

              </>
            )}
          </div>
        )}
        {/* ----------------------------------------------------------------------------------------------------------------------------- */}
      </div>
    </div>
  )
}
