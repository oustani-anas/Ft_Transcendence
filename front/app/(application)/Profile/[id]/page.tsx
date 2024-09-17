"use client";
import Achievements from "@/app/components/profile/achiemements/Achievements";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import Freinds from "./../../../components/profile/friends/Freinds";
import axios from "axios";
import { selectProfileInfo } from "@/redux/features/profile/profileSlice";
import LastGames from "@/app/components/profile/LastGames";
import Image from "next/image";
import NotUser from "../NotUser";
import AuthWrapper from "@/app/authWrapper";

export default function Profile(props: any) {
  const [userData, setUserData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSelector((state: RootState) => state.socket.socket);
  const myData = useSelector(selectProfileInfo);
  const [refreshStatus, setRefreshStatus] = useState(true);
  const [requestStatuss, setRequestStatuss] = useState<string>("notSentYet");
  const [refreshNotifs, setRefreshNoifications] = useState(false);
  const [clicked, setIsclicked] = useState(false);
  const [block, setblock] = useState(false);
  const [unblock, setUnblock] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  
  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get(
          `${url}/user/getUserByUserId?user=${props.params.id}`,
          { withCredentials: true }
          );
          setUserData(response.data);
          setIsLoading(false);
        } catch (error: any) {
          if (error.response.status === 404)
          setUserNotFound(true);
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };
    getUserData();
  }, [props.params.id, refreshNotifs, refreshStatus]);
  
  useEffect(() => {
    const sendFriendRequest = async () => {
      if (clicked) {
        try {
          await axios.post(`${url}/user/sendFriendRequest`, { sender: myData.id, target: props.params.id }, { withCredentials: true });
          setIsclicked(false);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };
    sendFriendRequest();
  }, [clicked]);

  useEffect(() => {
    const requestStatus = async () => {
      try {
        const areFriends = await axios.get(
          `${url}/user/checkIfFriend?myId=${myData.id}&&receiverId=${props.params.id}`,
          { withCredentials: true }
        );
        if (areFriends.data === 1) {
          setRequestStatuss("Accepted");
          return;
        }
        const status = await axios.get(`${url}/user/requestStatus?myId=${myData.id}&&receiverId=${props.params.id}`, { withCredentials: true });
        if (status.data) {
          if (status.data.senderId === myData.id && status.data.status === "Pending")
            setRequestStatuss("Pending");
          else if (
            status.data.receiverId === myData.id &&
            status.data.status === "Pending"
          )
            setRequestStatuss("AcceptFR");
          else setRequestStatuss("Declined");
        } else setRequestStatuss("notSentYet");
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    requestStatus();
  }, [props.params.id, refreshNotifs, refreshStatus]);

  useEffect(() => {
    socket?.onAny((event:any) => {
      if (event == "refreshStatus")
        setRefreshStatus(!refreshStatus);
      else if(event == "refreshFrontfriendShip")
        setRefreshNoifications(!refreshNotifs);
    });

    socket?.on("refreshAllInFront",(myId:string) =>{
      setRefreshStatus(!refreshStatus);
    });

    
    return () => {
      socket?.off("refreshAllInFront");
      socket?.off("refreshStatus");
      socket?.off("refreshFrontfriendShip");
    };
  });

  useEffect(() => {
    const requestStatus = async () => {
      if (block) {
        try {
          setblock(false);
          await axios.post(
            `${url}/user/blockUser`,
            { myId: myData.id, target: props.params.id },
            { withCredentials: true }
          );
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };
    requestStatus();
  }, [block]);

  useEffect(() => {
    const requestStatus = async () => {
      if (unblock) {
        try {
          setUnblock(false);
          setRefreshNoifications(!refreshNotifs);
          await axios.post(
            `${url}/user/UnblockUser`,
            { myId: myData.id, target: props.params.id },
            { withCredentials: true }
          );
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };
    requestStatus();
  }, [unblock]);

  const acceptFriendRequest = async () => {
    try {
      axios.post(
        `${url}/user/accept`,
        { myId: myData.id, target: props.params.id },
        { withCredentials: true }
      );
      setRefreshNoifications(!refreshNotifs);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  
  if(userNotFound){
  return <NotUser />
}
  return (
    <>
    <AuthWrapper>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="w-full h-[100vh] bg-[#dbe0f6] overflow-y-auto pt-[150px] flex flex-col items-center gap-5">
          <div className="flex xl:flex-row flex-col justify-center items-center w-[90%] gap-5">
            <div className="bg-white flex flex-col w-full xl:w-[900px] h-[750px] gap-3 rounded-xl">
              <div className="relative flex rounded-[16px] flex-col bg-[#f5f7ff] justify-between p-5 mx-5 mt-5">
                <div className="relative w-full flex items-start">
                  <div className="flex  flex-row items-center gap-[10px]">
                    <div className="min-w-[100px] min-h-[100px] relative">
                      <Image
                        src={userData?.avatar}
                        alt={userData?.avatar}
                        fill={true}
                        className="rounded-full object-cover" />
                    </div>
                    <div className="flex flex-row items-start gap-1 justify-center w-full">
                      <div className="flex flex-col justify-center items-center gap-1 w-max-content">
                        <div className="flex sm:flex-row flex-col gap-[4px]">
                          <div className="font-semibold text-[16px] text-[#252f5b]">
                            {userData.firstName}
                          </div>
                          <div className="font-semibold text-[16px] text-[#252f5b]">
                            {userData.lastName}
                          </div>
                        </div>
                        <div className="font-light text-[#7d84a3] text-[15px]"> {userData.username}</div>
                      </div>
                      {props.params.id !== myData.id && (
                        <div className={`${userData.status === "Online" ? "bg-green-700" : userData.status === "inGame" ? "bg-red-600" : "bg-gray-600"} bg-[#3c4778] flex justify-center items-center w-max-content sm:ml-3 px-2 h-full rounded-full mt-1 text-white `}>
                          <h4 className="text-[11px] p-[2px]">{userData.status === "Online" ? "Online" : userData.status === "inGame" ? "In A Game" : "Offline"}</h4>

                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {userData.blockedByUsers.find(
                  (id: string) => id === myData.id
                ) ? (
                  <div className="flex justify-center items-center h-[45px] w-full">
                    <button className="bg-blue-100 h-[45px] w-max-content px-7 rounded-full text-md 2xl:text-xl font-semibold text-[16px] text-[#252f5b] hover:bg-[#d9e4f6]" onClick={() => setUnblock(true)} > Unblock </button>
                  </div>
                ) : userData.blockedUsers.find(
                  (id: string) => id === myData.id
                ) ? (
                  <div className="flex justify-center items-center h-[45px] w-full font-light text-[18px] text-[#252f5b]"> This user blocked you </div>
                ) : (
                  props.params.id !== myData.id && (
                    <div className="flex flex-row justify-center items-center gap-3 lg:gap-9">
                      <div className="flex justify-center items-center sm:w-3/12 w-4/12 h-[45px]">
                        {requestStatuss === "Pending" ? (
                          <div className="bg-[#649eef] w-full h-full rounded-full font-semibold text-[16px] text-[#252f5b] flex items-center justify-center">Pending...{" "}</div>
                        ) : requestStatuss === "Accepted" ? (
                          <div className="bg-[#9ba8e1] w-full h-full rounded-full text-md 2xl:text-lg font-medium flex items-center justify-center">Friends</div>
                        ) : requestStatuss === "Declined" ||
                          requestStatuss === "notSentYet" ? (
                          <button className="bg-[#3fc592] w-full h-full rounded-full text-md 2xl:text-xl font-semibold text-[16px] text-[#252f5b]" onClick={() => { setIsclicked(true); }}>Add Friend</button>
                        ) : requestStatuss === "AcceptFR" ? (
                          <button className="bg-green-500 w-full h-full rounded-full text-[14px] 2xl:text-[16px] text-[#252f5b] font-medium" onClick={acceptFriendRequest}>Accept friend request</button>
                        ) : null}
                      </div>
                      <div className="flex justify-center items-center w-3/12 xl:w-3/12 h-[45px]">
                        <button className="bg-blue-100 w-full h-full rounded-full text-md 2xl:text-lg font-semibold text-[16px] text-[#252f5b] hover:bg-[#d9e4f6]" onClick={() => setblock(true)}>Block User</button>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="h-[70vh] max-h-[590px] rounded-[16px] mb-8 px-3 mx-5 overflow-y-visible overflow-x-hidden no-scrollbar bg-[#f4f6fb]">
                <LastGames userId={props.params.id} />
              </div>
            </div>
            <div className="xl:w-[900px] w-[100%] h-full">
              <Achievements userId={props.params.id} />
            </div>
          </div>

          <div className="xl:w-[1000px] h-[440px] flex w-[90%]  justify-center">
            <Freinds userId={props.params.id} />
          </div>
        </div>
      )}

    </AuthWrapper>
    </>
  );
}
