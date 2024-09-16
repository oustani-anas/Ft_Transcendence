"use client"
import React from 'react';
import SearchPanel from '../SearchPanel';
import PersonnelInfo from './PersonnelInfo';
import QRcode from './QRcode';


const ChangeInfo = () => {

    
  return (
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

 