"use client";
import PongGame from "./../../components/game//PongGame";
import { useEffect, useRef, useState } from "react";
import { PlayWithFriend } from "./../../components/game/PlayWithFriend";
import Image from "next/image";
// import { YourFriendsGame } from "@/app/(application)/game/againstOthers/againstFriend";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectProfileInfo } from "@/redux/features/profile/profileSlice";
import animationData from   "../../../public/nothing.json"
import Lottie from 'react-lottie-player';
import Link from "next/link";
import { io, Socket } from '@/../../node_modules/socket.io-client/build/esm/index';
import AuthWrapper from "@/app/authWrapper";

export default function Home() {
  const [playAi, setPlayAi] = useState<boolean>(false);
  const [playFriend, setplayFriend] = useState<boolean>(false);
  const [hide, setHide] = useState<string>("");
  const [addMembers, setAddMembers] = useState<boolean>(false);
  const [hToPlay, setHowToPlay] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState("ai");

  const [groupData, setGroupData] = useState<any>([]);
  const buttonAi = useRef<HTMLDivElement>(null);


  const userData = useSelector(selectProfileInfo);

  const [myFreinds, setMyFreinds] = useState([]);

  const profileInfo = useSelector(selectProfileInfo);
  

  

  useEffect(() => {

    const listFriends = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/user/userFreinds?userId=${profileInfo.id}`, { withCredentials: true });
        setMyFreinds(response.data);
      } catch (error:any) {
        console.log("Error fetching user data:", error.response.data.message);
      }

    };
    listFriends();
  }, [profileInfo]);

  const Play = async (tar:string):Promise<void> => 
  {
    console.log("invite to play");

    await axios.post(
      `http://localhost:4000/user/sendPlayAgain`,
      { sender: profileInfo.id, target:tar}, // to handel
      { withCredentials: true });
      console.log("connected1")
      const socket = io('http://localhost:4000', {
        path: '/play',
        query: {
          token: "token_data",
          id: profileInfo.id,
          tar: tar
        }
      });
      socket.emit('checker', { key:profileInfo.id, value: tar });
      }

  // const Play = async (tar:string):Promise<void> => 
  // {
  //   console.log("invite to play");
  //   console.log(userData.id);
  //   // console.log(groupData.members[0].id);
  //   await axios.post(
  //     `http://localhost:4000/user/sendPlayAgain`,
  //     { sender: userData.id, target:tar}, // to handel
  //     { withCredentials: true });
  // }

  const handleClickFr = () => {
    if (buttonAi.current) buttonAi.current.style.display = "none";
    setplayFriend((prev) => {
      return !prev;
    });
  };

  const handleClickAi = () => {
    if (buttonAi.current) buttonAi.current.style.display = "none";
    setPlayAi((prev) => {
      return !prev;
    });
  };



  // const PlayWithFriend = () => {
  //   setHide("hidden");
  //   setplayFriends((prev) => {
  //     return !prev;
  //   });
  // };


  return (
    <AuthWrapper>
      
      <div className="bg-[#dbe0f6] flex justify-center items-center w-full overflow-y-auto overflow-auto">
      <div className="flex flex-col justify-around items-center  w-full h-[100vh]"
          ref={buttonAi}>
        <div
          className={`flex flex-col justify-around items-center h-[17%] ${hide}`}
        >
          <div className="flex justify-center items-center h-[50%]">
            <p className="font-bold text-2xl text-[#252f5b]">READY TO PLAY ?</p>
          </div>
          <div className="font-semibold text-center text-[#252f5b] h-[50%] px-4">
            You can challenge your friends or play with AI online. Let's start !
          </div>
        </div>
        <div
          className="flex flex-col  justify-center items-center max-w-[1200px] w-full h-full px-5 gap-10">
          <div className="flex lg:flex-row flex-col justify-center items-center w-full h-[70%] gap-10">
            <div
              className="rounded-lg w-full h-full flex justify-center items-end gap-4  bg-cover bg-no-repeat bg-center"
              style={{ backgroundImage: `url(/friendsGame.webp)` }}
            >
              <div className="pb-5">
                <button
                  onClick={() => setAddMembers(!addMembers)}
                  className="w-[250px] h-[4vh] flex justify-center items-center gap-2  bg-[#dbe0f6] border-1 rounded-lg text-[#252f5b] text-[13px] hover:bg-[#c9d0f0] transition-all active:bg-[#a9b8e8]"
                >
                  <img
                    src="/multiping.png"
                    alt=""
                    className="w-[22px] h-[22px]"
                  />
                  Against friends
                </button>
                {addMembers && (
                  <div className="fixed flex justify-center items-center h-full w-full left-0 top-0 bg-[#000000] bg-opacity-80 z-50">
                    <div className="fixed  rounded-[20px] max-w-[1100px] w-[80%] mx-[50px] h-[80%] bg-[#6e7aaa] flex flex-col items-center ">
                      <div className="text-[#D7D7D7] w-full text-[34px] pt-8 text-center font-serif  self-start">
                        Invite Your Friends To play
                      </div>
                        <button
                          className="absolute top-4 right-4 text-[#D7D7D7] cursor-pointer"
                          onClick={() => setAddMembers(false)}
                        >
                          X
                        </button>
                      {myFreinds.length !== 0 ? (
                      <div className="h-full w-full flex justify-center items-center flex-col overflow-y-visible overflow-x-hidden no-scrollbar">

                      {myFreinds.map((value: any, index: number) => (
                        <div  key={index} className="flex justify-between  sm:flex-row p-[16px] items-center mb-10 bg-[#9ca5cc] w-[60%] rounded-[34px] ">
                          <div className="flex flex-row justify-around w-full items-center">
                            <div className="flex justify-between items-center gap-[16px]">
                                <img
                                  className="md:h-[80px] md:w-[80px] sm:w-[50px] w-[40px] ml-1 rounded-[50px] object-fill"
                                  src={value.avatar}
                                  alt="robiin"
                                  />
                              <div className="flex flex-col ">
                                <div className="md:text-[16px] sm:text-[14px] text-[12px] text-[#252f5b font-sans-only test">
                                  {value.firstName + " " + value.lastName}
                                </div>
                                <div className="md:text-[16px] sm:text-[14px] text-[12px] text-[#7d84a3] font-sans-only test">
                                  {value.username}
                                </div>
                              </div>
                            </div>
                            <div className="flex mt-4 md:text-[16px] text-[12px] sm:text-[14px] md:w-[120px] w-max-content">
                              <Link href="../Play" onClick={() => Play(value.id)}>
                                <button className=" md:w-[120px] w-max-content px-3 h-[45px] hover:bg-[#4f587d] bg-[#6E7AAE] text-[#D7D7D7] rounded-[15px] ml-6" >
                                  Invite
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ),)}

                      </div>
                      ) : (
                      <div className='w-[100%] h-full flex items-center justify-center'>
                      <Lottie animationData={animationData} play style={{ width: 180, height: 180 }} />
                    </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          <div
            className="rounded-lg w-full h-full flex justify-center items-end gap-4  bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: `url(/randomGame.webp)` }}
          >
            <div className="pb-5">
              <button
                onClick={handleClickFr}
                className="w-[250px] h-[4vh] flex justify-center items-center gap-2  bg-[#dbe0f6] border-1 rounded-lg text-[#252f5b] text-[13px] hover:bg-[#c9d0f0] transition-all active:bg-[#a9b8e8]"
              >
                <img
                  src="/singleping.png"
                  alt=""
                  className="w-[22px] h-[22px]"
                />
                Against random
              </button>
            </div>
          </div>
          </div>


          <div
              className="rounded-lg lg:w-[60%] w-full h-[35%] lg:h-[40%] flex justify-center items-end gap-4 bg-cover bg-no-repeat bg-center  r"
              style={{ backgroundImage: `url(/aiGame.webp)` }}
            >
              <div className="pb-5">
                  <button
                    onClick= {handleClickAi}
                    className="w-[250px] h-[4vh] flex justify-center items-center gap-2  bg-[#dbe0f6] border-1 rounded-lg text-[#252f5b] text-[13px] hover:bg-[#c9d0f0] transition-all active:bg-[#a9b8e8]"
                  >
                    <img
                      src="/robot.svg"
                      alt=""
                      className="w-[22px] h-[22px] bg-cover"
                    />
                    Against AI
                  </button>
              </div>
            </div>

        </div>
          <div>
            <button
            onClick={() => setHowToPlay(!hToPlay)}
            className=" bg-[#cfd5ef] shadow-md w-14 h-14 md:h-20 md:w-20 rounded-full flex justify-center items-center mb-5 hover:bg-[#c9d0f0] transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110  duration-150">
              <p className="font-bold text-[39px]">
                ?
              </p>
            </button>
            {hToPlay && (
              <div className="fixed flex justify-center items-center h-full w-full left-0 top-0 bg-[#000000] bg-opacity-80 z-50">
                <div className="fixed  rounded-[20px] max-w-[550px] w-[55%] mx-[50px] h-[35%] bg-[#6e7aaa] flex flex-col items-center justify-start ">
                  <div className="flex flex-col items-center justify-start w-full">
                    <button
                      className="absolute top-4 right-4 text-[#D7D7D7] cursor-pointer"
                      onClick={() => setHowToPlay(false)}>X</button>
                    <div className="rounded-lg w-[50%] flex justify-center items-center font-normal text-[16px] pt-2 sm:font-semibold sm:text-[23px]"><p className="text-[#252f5b]">How To Play ?</p></div>
                    <div className="flex items-center justify-center w-full h-[110px] gap-2">
                      <button className="bg-[#dbe0f6] border-1 rounded-lg w-[30%] h-[50%] flex justify-center items-center gap-2 text-[#252f5b] text-[13px] hover:bg-[#c9d0f0] transition-all active:bg-[#a9b8e8]"

                      onClick={() => {setActiveButton('ai')}}>
                      <img
                        src="/robot.svg"
                        alt=""
                        className="w-[22px] h-[22px] bg-cover"
                      />
                      <div > Against Ai</div>
                        </button>
                      <button className="bg-[#dbe0f6] border-1 rounded-lg w-[30%] h-[50%] flex justify-center items-center gap-2 text-[#252f5b] text-[13px] hover:bg-[#c9d0f0] transition-all active:bg-[#a9b8e8]"
                      onClick={() => {setActiveButton('friends')}}>
                      <img
                        src="/multiping.png"
                        alt=""
                        className="w-[22px] h-[22px] bg-cover"
                      />
                      <div > Against Friends</div>
                        </button>

                      <button className="bg-[#dbe0f6] border-1 rounded-lg w-[30%] h-[50%] flex justify-center items-center gap-2 text-[#252f5b] text-[13px] hover:bg-[#c9d0f0] transition-all active:bg-[#a9b8e8]"
                      onClick={() => {setActiveButton('random')}}>
                      <img
                        src="/singleping.png"
                        alt=""
                        className="w-[22px] h-[22px] bg-cover"
                      />
                      <div className=""> Against Random</div>
                        </button>
                    </div>
                  </div>
                    {activeButton === 'random' && (
                        <div className="w-[70%] h-full flex flex-col items-start justify-start overflow-hidden overflow-y-auto scrollbar-hide ">
                          <h3 className="font-bold text-[#252f5b] self-center text-[22px]">Random Rules</h3>
                          <ul className="list-disc flex flex-col font-semibold text-[20px] text-[#252f5b]">
                            <li className="">You win when you reach 5 point</li>
                            <li>If you left the game You loose automatictly</li>
                            <li>You can use arrow ⬆️⬇️ or mouse for movements</li>
                          </ul>
                          </div>
                    )
                    }
                    {activeButton === 'ai' && (
                        <div className="w-[70%] h-full flex flex-col items-start justify-start overflow-y-auto scrollbar-hide ">
                          <h3 className="font-bold text-[#252f5b] self-center text-[22px]">Ai Rules</h3>
                          <ul className="list-disc flex flex-col font-semibold text-[20px] text-[#252f5b]">
                            <li className="">You win when you reach 5 point</li>
                            <li>If you left the game You loose automatictly</li>
                            <li>You can use arrow ⬆️⬇️ or mouse for movements</li>
                          </ul>
                          </div>
                    )}
                    {activeButton === 'friends' && (
                        <div className="w-[70%] h-full flex flex-col items-start justify-start overflow-hidden overflow-y-auto scrollbar-hide ">
                          <h3 className="font-bold text-[#252f5b] self-center text-[22px]">Friends Rules</h3>
                          <ul className="list-disc flex flex-col font-semibold text-[20px] text-[#252f5b]">
                            <li className="">You win when you reach 5 point</li>
                            <li>If you left the game You loose automatictly</li>
                            <li>You can use arrow ⬆️⬇️ or mouse for movements</li>
                          </ul>
                          </div>
                    )}
                </div>

              </div>
            )}
          </div>
          
      </div>
        {playFriend && <PlayWithFriend />}
        {playAi && <PongGame />}
      
    </div>

    </AuthWrapper>
  );
}
