import { createReducer, createAction, PayloadAction } from "@reduxjs/toolkit";
import { components } from "@/services/openapi/mycelium-schema";

type Tenant = components["schemas"]["Tenant"];

const initialState = {
    tenantInfo: null as Tenant | null,
    isLoading: false,
}

export const setTenantInfo = createAction<Tenant | null>('tenant/setTenantInfo');

const tenantReducer = createReducer(initialState, (builder) => {
    builder.addCase(setTenantInfo, (state, action: PayloadAction<Tenant | null>) => {
        state.tenantInfo = action.payload;
    })
})

export default tenantReducer;
