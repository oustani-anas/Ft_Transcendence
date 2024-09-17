'use client'

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeSocket } from '@/redux/features/chatSlices/socketSlice';
import { selectProfileInfo } from '@/redux/features/profile/profileSlice';

const SocketInitializer = () => {
  const dispatch = useDispatch();
  const userData = useSelector(selectProfileInfo);

  useEffect(() => {
    if (userData.id) {
      dispatch(initializeSocket({ userId: userData.id }));
    }
  }, [userData.id]);

  return null;
};

export default SocketInitializer;
