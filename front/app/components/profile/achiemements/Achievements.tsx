import React, { useEffect, useState } from 'react'
import Achievement from './Achievement'
import axios from 'axios'



export default function Achievements({userId}: {userId: any}) {


    const [achievement, setAchievement] = useState<any>([]);

  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

    useEffect(() => { const achievement = async () => {
      try{
        const getachivem = await axios.get(`${url}/user/achievements?userId=${userId}`, {withCredentials: true})
          const achievement = await axios.get(`${url}/user/getAllAchievements?userId=${userId}`, {withCredentials: true})

          setAchievement(achievement.data);
      }
      catch(e){
      }
  };
  achievement();
  }, [])
  

  const achievementData = [
    {
      name: "Strawhat Rookie",
      status: "one",
      achieved: achievement.achiev1,
      achievedpic: "/images/achived.svg",
      notAchivedpic: "/lock-svg.svg",
      imagePath: "/Strawhatrookie.jpeg"
    },
    {
      name: "Chopper’s Backspin Defense",
      status: "two",
      achieved: achievement.achiev2,
      achievedpic: "/images/achived.svg",
      notAchivedpic: "/lock-svg.svg",
      imagePath: "/Chopper’sBackspinDefense.jpeg"
    },
    {
      name: "grandline dualist",
      status: "three",
      achieved: achievement.achiev3,
      achievedpic: "/images/achived.svg",
      notAchivedpic: "/lock-svg.svg",
      imagePath: "/grandlinedualist.jpeg"
    },
    {
      name: "Navigator’s Spin Master",
      status: "four",
      achieved: achievement.achiev4,
      achievedpic: "/images/achived.svg",
      notAchivedpic: "/lock-svg.svg",
      imagePath: "/Navigator’sSpinMaster.jpeg"
    },
    {
      name: "PirateKing’s Undefeated Reign",
      status: "five",
      achieved: achievement.achiev5,
      achievedpic: "/images/achived.svg",
      notAchivedpic: "/lock-svg.svg",
      imagePath: "/PirateKing’sUndefeatedReign.jpeg"
    },
    {
      name: "Sunny-Go Smash Champion",
      status: "six",
      achieved: achievement.achiev6,
      achievedpic: "/images/achived.svg",
      notAchivedpic: "/lock-svg.svg",
      imagePath: "/Sunny-GoSmashChampion.jpeg"
    }
  ]
    return (
        <>
            <div className="achievement xl:h-full xl:grid flex flex-col gap-2 p-4 bg-white overflow-hidden rounded-xl" style={{gridTemplateRows: "0.2fr 2fr 2fr 2fr"}}>
                <div className="col-span-2 text-[#1b244a] flex font-medium text-xl gap-[6px] ">
                    <img src="/achiev.svg" alt="" />
                    <h1>Achievements</h1></div>
                {
                    achievementData?.map((value:any, index:number) => (
                        <Achievement key={index} name={value.name} status={value.status} achieved={value.achieved} achievedpic={value.achievedpic} notAchivedpic={value.notAchivedpic}  imagePath={value.imagePath}  />
                    ))
                }
            </div>
        </>
    )
}
