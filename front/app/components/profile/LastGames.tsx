import { selectProfileInfo } from "@/redux/features/profile/profileSlice";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Lottie from 'react-lottie-player';
import animationData from   "../../../public/nothing.json"
import axios from "axios";


export default function LastGames({userId} : {userId: any}) {
  const profilepic = useSelector(selectProfileInfo);
  const [data, setData] = useState<any>();
  const [userData, setUserData] = useState<any>();
  const [last_games, setLastGames] = useState<any>([]);

  useEffect(() => {
    setData(profilepic);
  }, [profilepic]);

  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {const listFriends = async () => {
    try {
      const response = await axios.get(`${url}/user/lastGames?userId=${userId}`, { withCredentials: true });
      const userData = await axios.get(`${url}/user/getUserByUserId?user=${userId}`, { withCredentials: true });
      setUserData(userData.data);
      setLastGames(response.data);
    } catch (error) {
      console.error("Error :", error);
    }

  };
  listFriends();

  }, []);

  return (
    <div className="flex flex-col items-center justify-center  w-[100%]">
      <div className="items-center pl-10 py-3  text-gray  w-[100%] h-[48px]  mb-2 sticky top-0 bg-[#f4f6fb] text-[18px] text-[#263266]  font-medium flex gap-[6px]">
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
        Last Games
      </div>

      <div className="flex flex-col items-center justify-center w-full h-full">
        {last_games.length === 0 ? (
          <Lottie animationData={animationData} play style={{ width: 300, height: 300 }} />
        ) : (
          <>
            {last_games &&
              last_games.map((game: any, index: number) => (
                game.userId !== userId ?
                <div key={index} className="flex flex-row items-center justify-center w-full lg:w-10/12 2xl:w:10/12 " >
                  <div className="w-[50%] h-[150px] flex flex-row items-center justify-around">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-[16px] font-bold text-[#263266]"> {userData.username} </p>
                      <h4 className={game.userScore <  game.opponentScore ? `text-[#308a48] font-semibold text-[14px]` : `text-[#802c2c] font-semibold text-[14px]`}> {game.opponentScore} </h4>
                    </div>
                    <div className="w-[80px] h-[80px]">
                      <img src={userData?.avatar} alt="first player" className="w-[80px] h-[80px] object-cover rounded-full" />
                    </div>
                  </div>
                  <div className="w-[80px] h-[50px] mb-[1px] flex justify-center items-center"> <img src="../../../images/VS.svg" alt="VS" className="h-[30px] w-[30px]"/> </div>

                  <div className="w-[50%] h-[150px] flex flex-row items-center justify-around">
                    <div className="w-[80px] h-[80px]">
                      <img src={game.user?.avatar} alt="second" className="w-[80px] h-[80px] object-cover rounded-full"/>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-[16px] font-bold text-[#263266]">{game.user?.username}</p>
                      <h4 className={game.userScore >  game.opponentScore ? `text-[#308a48] font-semibold text-[14px]` : `text-[#802c2c] font-semibold text-[14px]`}>{game.userScore}</h4>
                    </div>
                  </div>
                </div>
                :null
              ))}
          </>
        )}
      </div>
    </div>
  );
}
