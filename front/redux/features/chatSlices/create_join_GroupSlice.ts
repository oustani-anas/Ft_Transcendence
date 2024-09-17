'use client'

import { PayloadAction, createSlice } from "@reduxjs/toolkit"


export const groupSlice = createSlice({
  name: "group",
  initialState: {
    createGroup: false,
    joinGroup: false,
    groupOptions: false
  },
  reducers: {
    setCreateGroup: (state, action: PayloadAction<any>) => {
      state.createGroup = action.payload;
    },
    setJoinGroup: (state, action: PayloadAction<any>) => {
      state.joinGroup = action.payload;
    },
    setGroupOptions: (state, action: PayloadAction<any>) => {
      state.groupOptions = action.payload;
    },
  },
});


export const { setCreateGroup } = groupSlice.actions;
export const { setJoinGroup } = groupSlice.actions;
export const { setGroupOptions } = groupSlice.actions;
export default groupSlice.reducer;
