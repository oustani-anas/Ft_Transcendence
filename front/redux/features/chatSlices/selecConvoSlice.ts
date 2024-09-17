'use client'

import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export const selecConvoSlice = createSlice({
    name: "selectConvo",
    initialState: {
        conversationId: ""
    },
    reducers: {
        selctedConversation: (state, action: PayloadAction<any>) =>{
            state.conversationId = action.payload;
        }
    }
})

export const {selctedConversation} = selecConvoSlice.actions;
export default selecConvoSlice.reducer;