'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { setProfileData } from '@/redux/features/profile/profileSlice';
import Home from '@/app/components/profile/Home';
import type { RootState } from '@/redux/store/store'
import { useSelector, useDispatch } from 'react-redux'
import AuthWrapper from '@/app/authWrapper';

axios.defaults.withCredentials = true;

export default function Page() {
  const dispatch = useDispatch();
  // const [user, setUser] = useState(null);
  // const socket = useSelector((state:RootState) => state.socket.socket);
  

  // const listFriends = async () => {
  //   const ret = await axios.post(`http://localhost:4000/user/userFreinds`, { withCredentials: true });
    
  // }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/user/me');
        const userData = response.data.user;
        // setUser(userData);
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
