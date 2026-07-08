import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

import branchReducer from "./slices/branchSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    branch: branchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;