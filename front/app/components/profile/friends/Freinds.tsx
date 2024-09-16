import React from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import FreindInfo from './FreindInfo';

export default function freinds({userId} : {userId: any}) {

  return (
    <div className='friends h-[430px]  gap-5 p-[15px] bg-white w-[100%] rounded-xl mb-5 flex flex-col justify-center '>

      <div className="flex justify-start items-center pt-3 pl-10">
        <div
          className={`cursor-pointer border-[#8292D7] w-[15%] mb-2 text-xl text-[#263266]  font-medium flex gap-[6px]`}
        >
          <img src="../../../creatg.svg" alt="../../../creatg.svg" />
          Freinds
        </div>

      </div>
      <FreindInfo userId={userId} />

    </div>
  );
}