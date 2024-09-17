import { createSelector, createSlice } from "@reduxjs/toolkit";
import { request } from "http";
import { requestSlice } from "../freinds/requestSlice";

export const achievementSlice = createSlice({
    name: 'achievement',
    initialState:  {
        achievementInfo: []
    },
    reducers: {
        setAchievementInfo: (state, action) => {
            return {
                ...state,
                achievementInfo: action.payload
            }
        }
    }
});

export const selectAchievement = createSelector(
    (state) => state.achievement,
    (substate) => substate.achievementInfo
)

export const { setAchievementInfo } = achievementSlice.actions;