import { createSelector, createSlice } from '@reduxjs/toolkit';

export const profileSlice:any = createSlice({
  name: 'profile',
  initialState: {
    profileData: {
      // firstName:'23232',
      // lastName:'2323',
      // username:'2323',
      // avatar:'2332',
      // id:'22323'
    },
    
  },
  reducers: {
      setProfileData: (state, action) => {
        return {
          ...state,
          profileData: action.payload
        }
      }
    },
});

export const selectProfileInfo = createSelector(
  (state:any) => state.profile,
  (substate) => substate.profileData
);

export const { setProfileData } = profileSlice.actions;
