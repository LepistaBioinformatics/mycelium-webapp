import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profile.state';
import tenantReducer from './tenant.state';
import notificationReducer from './notification.state';

const store = configureStore({
    reducer: {
        profile: profileReducer,
        tenant: tenantReducer,
        notification: notificationReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
