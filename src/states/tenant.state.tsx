import { createReducer, createAction, PayloadAction } from "@reduxjs/toolkit";
import { components } from "@/services/openapi/mycelium-schema";

type Tenant = components["schemas"]["Tenant"];

const initialState = {
    tenantId: null as string | null,
    tenantInfo: null as Tenant | null,
    isLoading: false,
}

export const setTenantId = createAction<string>('tenant/setTenantId');

export const setTenantInfo = createAction<Tenant | null>('tenant/setTenantInfo');

const tenantReducer = createReducer(initialState, (builder) => {
    builder.addCase(setTenantId, (state, action: PayloadAction<string>) => {
        state.tenantId = action.payload;
    })

    builder.addCase(setTenantInfo, (state, action: PayloadAction<Tenant | null>) => {
        state.tenantInfo = action.payload;
    })
})

export default tenantReducer;
