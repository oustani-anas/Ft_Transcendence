import { createSelector, createSlice } from "@reduxjs/toolkit";
import { request } from "http";
import { requestSlice } from "../freinds/requestSlice";

export const lastGameSlice = createSlice({
    name: 'lastGame',
    initialState:  {
        lastGameInfo: []
    },
    reducers: {
        setLastGameInfo: (state, action) => {
            return {
                ...state,
                lastGameInfo: action.payload
            }
        }
    }
});

export const selectLastGames = createSelector(
    (state) => state.lastGame,
    (substate) => substate.lastGameInfo
)

export const { setLastGameInfo } = lastGameSlice.actions;