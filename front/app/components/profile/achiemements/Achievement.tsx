import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { selectProfileInfo } from "@/redux/features/profile/profileSlice";
import axios from "axios";

export default function Achievement({
  name,
  status,
  achieved,
  imagePath,
  achievedpic,
  notAchivedpic,
}: {
  name: string;
  status: string;
  achieved: boolean;
  imagePath: string;
  achievedpic: string;
  notAchivedpic: string;
}) {

  return (
    <div
      className={`bg-[#f4f6ff] flex justify-between h-full mb-[14px] rounded-lg overflow-hidden lg:col-span-2 2xl:col-span-1`}>
      <div
        className={
          achieved ? `flex flex-col justify-between h-[80%] w-[58%]  items-start`: `flex flex-col justify-between h-[80%] w-[58%] items-start blur-[2px]`}>
        <div className="m-2">
          <h2 className="text-[13px] sm:text-[16px] xl:text-[16px] font-semibold text-[#252f5b]">{name}</h2>
          <p className="text-sm text-[#252f5b]">{status}</p>
        </div>
        <div className={`flex flex-row justify-start items-start gap-1 ml-2 `}>
          <div>
            {achieved ? (
              <Image src={achievedpic} alt="mark" width={5} height={4} className="w-4 h-4"/>
            ) : (
              <Image src={notAchivedpic}  alt="mark"  width={5} height={5} className="w-5 h-5"/>
            )}
          </div>
          <div>

            {achieved ? (
              <p className="text-[12px] font-semibold text-[#7187E2]">Achieved</p> ) 
              : (
              <p className="text-[12px] font-semibold text-[#7187E2]">Not Achieved </p>
            )}
          </div>
        </div>
      </div>
      <div
        className={
          achieved
            ? `bg-[#D4CACA] flex justify-center items-center w-[40%] relative overflow-hidden`
            : `bg-[#D4CACA] flex justify-center items-center w-[40%] relative overflow-hidden blur-md`
        }
      >
        <Image src={imagePath} alt={name} fill={true} draggable={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover"/>
      </div>
    </div>
  );
}




