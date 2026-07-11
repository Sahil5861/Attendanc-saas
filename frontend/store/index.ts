import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

import branchReducer from "./slices/branchSlice";
import notificationReducer from "./slices/notificationSlice";
import layoutReducer from "./slices/layoutSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    branch: branchReducer,
    notification: notificationReducer,
    layout: layoutReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;