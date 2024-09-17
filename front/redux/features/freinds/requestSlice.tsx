import { createSelector, createSlice } from '@reduxjs/toolkit';
import React from 'react';

export const requestSlice = createSlice({
  name: 'request',
  initialState: {
    freindInfo: {},
    freindRequestInfo: {}
  },
  reducers: {
    setFreindInfo: (state, action) => {
        return{
          ...state,
          freindInfo: action.payload
        }
      },
      setFreindRequestInfo: (state, action) => {
      return {
        ...state,
        freindRequestInfo: action.payload
      }
    }
  },
});

export const selectFreindInfo = createSelector(
  (state) => state.request,
  (substate) => substate.freindInfo
);
export const selectFreindRequestInfo = createSelector(
  (state) => state.request,
  (substate) => substate.freindRequestInfo
);

export const { setFreindInfo, setFreindRequestInfo } = requestSlice.actions;
