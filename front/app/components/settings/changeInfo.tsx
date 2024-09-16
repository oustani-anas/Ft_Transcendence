"use client"
import React, { useEffect } from 'react';
import Image from 'next/image';
import SearchPanel from '../SearchPanel';
import { setFreindRequestInfo, setFreindInfo } from '../../../redux/features/freinds/requestSlice';
import { useDispatch} from "react-redux"
import { useState } from 'react';
import { setAchievementInfo } from '../../../redux/features/achievement/achievementSlice';
import AchievementData from '../../achiev.json';
import FreindData from '../../freindslist.json';
import allFreinds from '../../freinddata.json';
import LeftBar from '@/app/components/leftBar';
import PersonnelInfo from './PersonnelInfo';
import QRcode from './QRcode';


const ChangeInfo = () => {

    
  return (
    //had div d search bar w notification
    <div className="h-screen md:h-[100vh]  w-full flex flex-col no-scrollbar overflow-hidden">
        <div className='w-full h-[8%] flex flex-row justify-around items-center'>
          <SearchPanel />
        </div>
        <div className='flex lg:flex-row flex-col justify-center items-center h-full w-full  gap-[24px] px-[24px]'>
          <div className="w-10/12 lg:w-[500px] h-[40vh] flex justify-evenly items-center  flex-col bg-white rounded-[40px] ">
            <PersonnelInfo />
          </div>
          <div className='bg-white flex flex-col justify-center items-center w-10/12 lg:w-[500px] h-[40vh] lg:h-[40vh] rounded-[40px] gap-[30px]'>
            <QRcode />
          </div>
        </div>
    </div>
  );
};

export default ChangeInfo;

 