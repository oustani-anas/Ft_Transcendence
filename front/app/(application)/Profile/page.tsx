'use client'
import React, { useEffect } from 'react';
import axios from 'axios';
import { setProfileData } from '@/redux/features/profile/profileSlice';
import Home from '@/app/components/profile/Home';
import { useDispatch } from 'react-redux'
import AuthWrapper from '@/app/authWrapper';

axios.defaults.withCredentials = true;

export default function Page() {
  const dispatch = useDispatch();
  
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${url}/user/me`);
        const userData = response.data.user;
        dispatch(setProfileData(userData));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchData();
  },[]);
  
  return (
    <AuthWrapper>
        <div className='w-full bg-[#dbe0f6] overflow-y-auto '>
          <Home  />
        </div>
      </AuthWrapper>
  )
}
