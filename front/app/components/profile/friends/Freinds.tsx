import React, { useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useState } from 'react';
import FreindsRequests from './FreindsRequests';
import FreindInfo from './FreindInfo';
import { selectProfileInfo } from '@/redux/features/profile/profileSlice';
import { useSelector } from 'react-redux';

export default function freinds({userId} : {userId: any}) {
  // const [activeTab, setActiveTab] = useState('freinds');
  // const user = useSelector(selectProfileInfo);

  // const handleTabChange = (tab: any) => {
  //   setActiveTab(tab);
  // };
  // useEffect(() => {
  //   setActiveTab('freinds');
  // }, []);

  return (
    <div className='friends h-[430px]  gap-5 p-[15px] bg-white w-[100%] rounded-xl mb-5 flex flex-col justify-center '>

      <div className="flex justify-start items-center pt-3 pl-10">
        <div
          className={`cursor-pointer border-[#8292D7] w-[15%] mb-2 text-xl text-[#263266]  font-medium flex gap-[6px]`}
          // onClick={() => handleTabChange('freinds')}
        >
          <img src="../../../creatg.svg" alt="../../../creatg.svg" />
          Freinds
        </div>
        {/* <div
          className={`border-b-2 cursor-pointer ${activeTab === 'requests' ? 'border-[#8292D7]' : null} w-[max-content] mb-2 text-xl ml-[12%]`}
          onClick={() => handleTabChange('requests')}
        >
          freinds Requests
        </div> */}
      </div>
      <FreindInfo userId={userId} />
      {/* {activeTab === 'requests' && <FreindsRequests />} */}

    </div>
  );
}