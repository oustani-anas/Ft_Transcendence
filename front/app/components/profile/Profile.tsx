import LastGames from './LastGames';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectProfileInfo } from '../../../redux/features/profile/profileSlice';
import {  useEffect, useState } from 'react';
import CustomLoading from '../loading';

export default function Profile() {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const ProfileInfo = useSelector(selectProfileInfo);

  useEffect(() => {
    setLoading(true);
    setData(ProfileInfo);
    setLoading(false);
  }, [ProfileInfo]);


  return (
    <>
      {loading ? (
        <CustomLoading  />
      ) : (
        <div className='bg-white flex flex-col rounded-[20px] overflow-hidden w-full h-full items-center justify-center'>
          <div className='relative  w-[94%] rounded-[16px] h-[16%] flex gap-3 justify-between items-center px-3 border-black pb-2 bg-[#f5f7ff]'>
            <div className='flex items-center gap-3 ml-2'>
              <div className=''>
                <img className='w-[80px] h-[80px] rounded-full object-cover' src={data?.avatar} alt={data?.avatar} />
              </div>
              <div>
                <div className='font-semibold text-[18px] text-[#252f5b]'>{data?.firstName}</div>
                <div className='font-light text-[#7d84a3] text-[14px]'>{data?.username}</div>
              </div>
            </div>
            <div>
              <Link href='./../Settings'>
                <div className='mr-4'>
                  <img className='w-[30px] h-[30px] object-cover' src="./../../../../settings.svg" alt="settingsLogo" />
                </div>
              </Link>
            </div>
          </div>
          <div className='h-[70vh] max-h-[580px] w-[94%] rounded-[16px] mt-3 overflow-y-visible overflow-x-hidden no-scrollbar bg-[#f4f6fb]'>
            <LastGames userId={ProfileInfo.id}/>
          </div>
        </div>
      )}
    </>
  );
}
