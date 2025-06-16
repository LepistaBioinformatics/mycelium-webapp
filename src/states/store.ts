import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profile.state';
import tenantReducer from './tenant.state';
import notificationReducer from './notification.state';
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
    key: "myc",
    storage,
};

const profilePersistedReducer = persistReducer(persistConfig, profileReducer);
const tenantPersistedReducer = persistReducer(persistConfig, tenantReducer);
const notificationPersistedReducer = persistReducer(persistConfig, notificationReducer);

const store = configureStore({
    reducer: {
        profile: profilePersistedReducer,
        tenant: tenantPersistedReducer,
        notification: notificationPersistedReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    })
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default { store, persistor };
