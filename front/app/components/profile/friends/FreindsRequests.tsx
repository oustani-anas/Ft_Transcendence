// MyComponent.js

import React, { useEffect } from 'react'
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
import { selectFreindRequestInfo } from '../../../../redux/features/freinds/requestSlice';

export default function FreindsRequests() {

    const array = useSelector(selectFreindRequestInfo);
    return (
        <div className='w-full flex justify-center items-center h-[85%]'>
            <Swiper
                spaceBetween={3}
                slidesPerView={6}
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                      },
                      768: {
                        slidesPerView: (array && array.length > 0) ? 2 : 1,
                      },
                      1100: {
                        slidesPerView: array && array.length > 0 ? 3 : 1,
                      },
                      1350: {
                        slidesPerView: array && array.length > 0 ? 4 : 1,
                    },
                }}
                className="w-full cursor-grab !pl-[30px]">
                {array && array.length > 0 ?
                    array.map((value: any, index: number) => {
                        return (
                            <>
                                <SwiperSlide >
                                    <TeamCard key={index} userId={value.id} fname={value.firstName + " " + value.lastName} name={value.username} image={value.avatar} status={value.status}/>
                                </SwiperSlide>
                            </>
                        )
                    })
                    :
                    (<SwiperSlide>
                        <div className="w-full h-full flex items-center justify-center">
                            <p className='w-full text-center'>No friends available</p>
                        </div>
                    </SwiperSlide>)
                }
            </Swiper>
        </div>
    )
}