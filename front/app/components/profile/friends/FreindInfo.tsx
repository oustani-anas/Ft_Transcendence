import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import TeamCard from './TeamCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import axios from 'axios';
import { selectProfileInfo } from '@/redux/features/profile/profileSlice';
import Lottie from 'react-lottie-player';
import animationData from   "../../../../public/nothing.json"
import { RootState } from "@/redux/store/store";

export default function FreindInfo({userId}: {userId: string}) {
  const profileInfo = useSelector(selectProfileInfo);
  const [myFreinds, setMyFreinds] = useState([]);
  const [refreshStatus, setRefreshStatus] = useState(true);
  const socket = useSelector((state: RootState) => state.socket.socket);

  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {

    const listFriends = async () => {
      try {
        
        const response = await axios.get(`${url}/user/userFreinds?userId=${userId}`, { withCredentials: true });
        
        setMyFreinds(response.data);
      } catch (error:any) {
      }

    };
    listFriends();
  }, [profileInfo, refreshStatus]);


  useEffect(() => {

    socket?.on("refreshStatus", () => {
      setRefreshStatus(!refreshStatus);
    });
    socket?.on("refreshAllInFront",(myId:string) =>{
      setRefreshStatus(!refreshStatus);
    });
    socket?.on("refreshFrontfriendShip", (channelStatus: any) => {
      setRefreshStatus(!refreshStatus);
    });


    return () => {
      socket?.off("refreshStatus");
      socket?.off("refreshAllInFront");
      socket?.off("refreshFrontfriendShip");
    };
  });

  return (
    <>
    {myFreinds && myFreinds.length > 0 ? (
      <div className='w-full flex justify-center items-center h-full'>
        <Swiper
          spaceBetween={3}
          slidesPerView={6}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1100: {
              slidesPerView: 3,
            },
            1350: {
              slidesPerView: 4,
            },
          }}
          className="w-full cursor-grab !pl-[30px] " >
          {
            myFreinds.map((value: any, index: number) => {
              return (
                  <SwiperSlide key={index} >
                    <TeamCard key={index}  userId={value.id} fname={value.firstName + " " + value.lastName} name={value.username} image={value.avatar} status={value.status} />
                  </SwiperSlide>
              )
            })
          }
          </Swiper>
          </div>
          ) 
          : 
          (
            <div className='w-[100%] h-full flex items-center justify-center'>
              <Lottie animationData={animationData} play style={{ width: 300, height: 300 }} />
            </div>

    )
  }
  </>
  )
}