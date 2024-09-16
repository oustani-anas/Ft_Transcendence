

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import Link from "next/link";
import axios from "axios";
import { selectProfileInfo } from "@/redux/features/profile/profileSlice";
import { io } from '@/../../node_modules/socket.io-client/build/esm/index';

const TeamCard = ({
  name,
  image,
  userId,
  fname,
  status,
}: {
  name: string;
  image: string;
  userId: string;
  fname: string;
  status: string;
}) => {
  
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const Play = async (tar:string):Promise<void> => 
  {
    await axios.post(
      `${url}/user/sendPlayAgain`,
      { sender: myData.id, target:tar},
      { withCredentials: true });
      
        const socket = io(`${url}`, {
          path: '/play',
          query: {
            token: "token_data",
            id: myData.id,
            tar: tar
          }
        });
        socket.emit('accepted_request', { key:myData.id, value: tar });
      }
  
  const myData = useSelector(selectProfileInfo);

  const [groupId, setGroupId] = useState<any>();
  const [isMyId, setIsMYId] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsMYId(myData.id === userId);
        const response = await axios.get(`${url}/Chat/getDm?myId=${myData.id}&othersId=${userId}`, { withCredentials: true });

        setGroupId(response.data);

        if (myData.id !== userId) {

          const areFriends = await axios.get(`${url}/user/checkIfFriend?myId=${myData.id}&&receiverId=${userId}`, { withCredentials: true });
          setIsFriend(areFriends.data);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [myData.id, userId]);

  return (
    <div className="w-[80%] lg:w-[98%] flex flex-col justify-evenly items-center h-[85%] rounded-[30px] bg-[#f5f7ff] relative overflow-hidden ">
      <div className="flex flex-col gap-[8px] items-center">
        <div className=" w-[90px] h-[90px]">
          <Link href={`./../../Profile/${userId}`}>
            <div>
              <div className='relative'>
                <div className={`absolute w-[10px] h-[10px] ${status === "Online" ? "bg-green-700" : status === "inGame" ? "bg-red-600" : "bg-gray-600"} rounded-full right-[17%] top-2`}></div>
              </div>
              <div className="w-[80px] h-[80px] overflow-hidden">
                <Image
                  src={image}
                  alt={name}
                  width={66}
                  height={66}
                  className="rounded-[50%] object-cover"
                />
              </div>
            </div>
          </Link>
        </div>
        <div className="">
          <p className=" font-semibold  text-[#252f5b]">{fname}</p>
          <p className="text-[14px] text-[#7d84a3]">{name}</p>
        </div>
      </div>
      {!isMyId && isFriend ? (
        <div className="w-full flex justify-center items-center gap-[16px] ">
           <Link href={`/Play/${userId}`} onClick={() => Play(userId)}
           className="rounded-[10px] cursor-pointer w-[60%] bg-[#d3dafb] h-[40px] flex  items-center justify-center hover:bg-[#c3cdfb] ">
          <button className=" rounded-[10px] cursor-pointer w-[60%] bg-[#d3dafb] h-[40px] flex flex-row-reverse items-center justify-center gap-[8px] hover:bg-[#c3cdfb]">
            <div className="">
              <p className="text-[#252f5b] text-[14px] font-semibold">
                Lets Play
              </p>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 38 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Group 88">
                <path
                  id="Union"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.4827 3.16998V0.169983H14.4827H10.862C7.99126 0.169983 5.3193 0.970635 3.37028 2.91966C1.42126 4.86868 0.620605 7.54063 0.620605 10.4114V23.6872C0.620605 26.558 1.42126 29.2299 3.37028 31.1789C5.3193 33.128 7.99126 33.9286 10.862 33.9286H14.4827H17.4827V30.9286V3.16998ZM3.62061 10.4114C3.62061 5.74551 6.19613 3.16998 10.862 3.16998H11.4827H14.4827V6.16998V27.9286V30.9286H11.4827H10.862C6.19613 30.9286 3.62061 28.3531 3.62061 23.6872V10.4114ZM9.05164 14.0321C10.718 14.0321 12.0689 12.6812 12.0689 11.0148C12.0689 9.34843 10.718 7.99757 9.05164 7.99757C7.38526 7.99757 6.0344 9.34843 6.0344 11.0148C6.0344 12.6812 7.38526 14.0321 9.05164 14.0321Z"
                  fill="#252f5b"
                />
                <path
                  id="Subtract"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20.4829 0.169983L20.4829 35.17H27.2415C30.0247 35.17 32.6849 34.3369 34.6434 32.2385C36.6019 30.1401 37.3795 27.2899 37.3795 24.3079L37.3795 11.0321C37.3795 8.05006 36.6019 5.19984 34.6434 3.10145C32.6849 1.00307 30.0247 0.169983 27.2415 0.169983H20.4829ZM28.3277 15.8596C26.6614 15.8596 25.3105 17.2105 25.3105 18.8769C25.3105 20.5433 26.6614 21.8941 28.3277 21.8941C29.9941 21.8941 31.345 20.5433 31.345 18.8769C31.345 17.2105 29.9941 15.8596 28.3277 15.8596Z"
                  fill="#252f5b"
                />
              </g>
            </svg>
          </button>
           </Link>

          <Link
            className="rounded-[10px] cursor-pointer w-[16%] bg-[#d3dafb] h-[40px] flex  items-center justify-center hover:bg-[#c3cdfb] "
            href={`/Chat/${groupId}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.12522e-05 9.99771C0.000512806 7.80531 0.721493 5.67383 2.05199 3.93131C3.38249 2.18878 5.24877 0.931794 7.3636 0.353791C9.47844 -0.224213 11.7246 -0.0911964 13.7565 0.732369C15.7883 1.55593 17.4932 3.0244 18.6087 4.91178C19.7242 6.79915 20.1886 9.00083 19.9304 11.178C19.6721 13.3551 18.7055 15.387 17.1794 16.961C15.6532 18.5351 13.6521 19.5639 11.484 19.8893C9.31588 20.2146 7.10092 19.8184 5.18001 18.7617L1.29201 19.9457C1.11859 19.9985 0.934075 20.0032 0.758197 19.9593C0.582318 19.9153 0.421694 19.8244 0.293506 19.6962C0.165318 19.568 0.0743871 19.4074 0.0304406 19.2315C-0.0135059 19.0556 -0.00881521 18.8711 0.0440111 18.6977L1.22801 14.8037C0.41992 13.3309 -0.00251363 11.6776 1.12522e-05 9.99771ZM6 8.99771C6 9.26292 6.10536 9.51728 6.2929 9.70481C6.48043 9.89235 6.73479 9.99771 7 9.99771H13C13.2652 9.99771 13.5196 9.89235 13.7071 9.70481C13.8946 9.51728 14 9.26292 14 8.99771C14 8.73249 13.8946 8.47814 13.7071 8.2906C13.5196 8.10307 13.2652 7.99771 13 7.99771H7C6.73479 7.99771 6.48043 8.10307 6.2929 8.2906C6.10536 8.47814 6 8.73249 6 8.99771ZM7 11.9977C6.73479 11.9977 6.48043 12.1031 6.2929 12.2906C6.10536 12.4781 6 12.7325 6 12.9977C6 13.2629 6.10536 13.5173 6.2929 13.7048C6.48043 13.8923 6.73479 13.9977 7 13.9977H11C11.2652 13.9977 11.5196 13.8923 11.7071 13.7048C11.8946 13.5173 12 13.2629 12 12.9977C12 12.7325 11.8946 12.4781 11.7071 12.2906C11.5196 12.1031 11.2652 11.9977 11 11.9977H7Z"
                fill="#252f5b"
              />
            </svg>
          </Link>
        </div>
      )
        : null
      }
    </div>
  );
};

export default TeamCard;
