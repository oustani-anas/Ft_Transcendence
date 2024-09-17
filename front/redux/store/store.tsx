import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist/es/constants';

import { requestSlice } from '../features/freinds/requestSlice';
import { achievementSlice } from '../features/achievement/achievementSlice';
import { profileSlice } from '../features/profile/profileSlice';
import socketReducer from "../features/chatSlices/socketSlice";
import groupReducer from "../features/chatSlices/create_join_GroupSlice";
import selectConvoReducer from "../features/chatSlices/selecConvoSlice";
import { lastGameSlice } from '../features/lastGamesSlice/lastGameSlice';
import notificationsReducer from '../features/notificationsSlice';
import refreshReducer from '../features/chatSlices/refreshSlice';

const persistProfileConfig = {
    key: "profile",
    storage: storage,
}
const persistedProfileReducer = persistReducer(persistProfileConfig, profileSlice.reducer);
const store = configureStore({
    reducer: {
        request: requestSlice.reducer,
        achievement: achievementSlice.reducer,
        profile: persistedProfileReducer,
        lastGame: lastGameSlice.reducer,
        socket: socketReducer,
        group: groupReducer,
        seelctedConversation:  selectConvoReducer,
        refreshNotifs: notificationsReducer,
        refresh: refreshReducer
        
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],  
                ignoredPaths: ['socket', 'profile'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
export const profilePersistor = persistStore(store);
