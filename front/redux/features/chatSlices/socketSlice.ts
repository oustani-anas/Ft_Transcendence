// socketSlice.ts
'use client'
// socketSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import Cookies from "js-cookie";

const initialState: any = {
  socket: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    initializeSocket: (state, action) => {
      const { userId } = action.payload;
      const token = Cookies.get("JWT_TOKEN");
      state.socket = io("http://localhost:4000/", {
        auth: {
          jwt_token: token
        }
      });
      if (state.socket) {
        state.socket.emit('addSocketToThisUserRoom', userId);
      }
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
