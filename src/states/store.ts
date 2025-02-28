import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profile.state';
import tenantReducer from './tenant.state';
import authReducer from './auth.state';

const store = configureStore({
    reducer: {
        profile: profileReducer,
        tenant: tenantReducer,
        auth: authReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
