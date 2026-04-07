import { configureStore } from '@reduxjs/toolkit';
import tenantReducer from './tenant.state';
import notificationReducer from './notification.state';
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const tenantPersistConfig = {
    key: "myc-tenant",
    storage,
};

const tenantPersistedReducer = persistReducer(tenantPersistConfig, tenantReducer);

const store = configureStore({
    reducer: {
        tenant: tenantPersistedReducer,
        notification: notificationReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    })
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default { store, persistor };
