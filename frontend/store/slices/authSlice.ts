// store/slices/authSlice.ts

import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
    user: any;
    permissions: string[];
    initialized: boolean;
    plan: any;
}

const initialState: AuthState = {
  user: null,
  permissions: [],
  initialized: false,
  plan: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,



  reducers: {
    setAuth: (state, action) => {

      console.log('payload : ', action.payload);
      
      state.user = action.payload.user;
      state.permissions = action.payload.permissions || [];
      state.initialized = true;
      state.plan = action.payload.plan;
    },

    logout: (state) => {
      state.user = null;
      state.permissions = [];
      state.initialized = true;
      state.plan = null;
    },
  },
});

export const {
  setAuth,
  logout
} = authSlice.actions;

export default authSlice.reducer;