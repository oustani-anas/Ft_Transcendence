'use client'

import { PayloadAction, createSlice } from "@reduxjs/toolkit"


export const refreshSlice = createSlice({
  name: "refresh",
  initialState: {
    refresh: false,
  },
  reducers: {
    setRefreshConvos: (state, action: PayloadAction<any>) => {
      state.refresh = action.payload;
    },
  },
});


export const { setRefreshConvos } = refreshSlice.actions;
export default refreshSlice.reducer;
