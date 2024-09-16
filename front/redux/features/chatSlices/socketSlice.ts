// socketSlice.ts
'use client'
// socketSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import Cookies from "js-cookie";

const initialState: any = {
  socket: null,
};

const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    initializeSocket: (state, action) => {
      const { userId } = action.payload;
      const token = Cookies.get("JWT_TOKEN");
      state.socket = io(`${url}`, {
        auth: {
          jwt_token: token
        }
      });
    },
    closeSocket: (state) => {
      if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
      }
    },
  },
});


export const { initializeSocket, closeSocket } = socketSlice.actions;
export default socketSlice.reducer;
