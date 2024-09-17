'use client'

import { PayloadAction, createSlice } from "@reduxjs/toolkit"


export const refreshNotificationsSlice = createSlice({
  name: "refreshNoifs",
  initialState: {
    refreshNoifications: false,
  },
  reducers: {
    setRefreshNoifications: (state, action: PayloadAction<any>) => {
      state.refreshNoifications = action.payload;
    },
  },
});


export const { setRefreshNoifications } = refreshNotificationsSlice.actions;
export default refreshNotificationsSlice.reducer;
