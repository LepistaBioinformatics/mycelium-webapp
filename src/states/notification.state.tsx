import { createReducer, createAction, PayloadAction } from "@reduxjs/toolkit";
import { components } from "@/services/openapi/mycelium-schema";

type HttpResponse = components["schemas"]["HttpJsonResponse"];

interface NotificationState {
    title?: string | null;
    notification: HttpResponse | string | null;
    type: "error" | "info" | "success" | "warning";
}

const initialState: NotificationState | null = {
    title: null,
    notification: null as HttpResponse | string | null,
    type: "info",
}

export const setNotification = createAction<NotificationState>('notification/setNotification');

export const clearNotification = createAction('notification/clearNotification');

const notificationReducer = createReducer(initialState, (builder) => {
    builder.addCase(setNotification, (state, action: PayloadAction<NotificationState | null>) => {
        if (!action.payload) {
            state.title = null;
            state.notification = null;
            state.type = "info";
            return;
        }

        state.title = action.payload.title;
        state.notification = action.payload.notification;
        state.type = action.payload.type;
    })

    builder.addCase(clearNotification, (state) => {
        state.title = null;
        state.notification = null;
        state.type = "info";
    })
})

export default notificationReducer;
