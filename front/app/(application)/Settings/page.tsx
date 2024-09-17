'use client'
import React, { useEffect, useState } from 'react'
import ChangeInfo from '../../components/settings/changeInfo'
import { useDispatch } from 'react-redux';
import { setProfileData } from '@/redux/features/profile/profileSlice';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AuthWrapper from '@/app/authWrapper';

axios.defaults.withCredentials = true;

export default function page() {

  const dispatch = useDispatch();
  let user;
  const router = useRouter();
  const [id , setId] = useState();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${url}/user/me`, {
        });
        setId(response.data.user.id);
        user = response.data.user;
        
        dispatch(setProfileData(user));
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/');
        
      }
    };
    fetchData();
  }, [id]);
 

  return (
    <AuthWrapper>
      <div className='w-full bg-[#e7edff] overflow-y-auto'>   
        <ChangeInfo />
      </div>
    </AuthWrapper>
  )
}



