
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "user";

const getSavedUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getSavedUser(),
  isAuthenticated: Boolean(getSavedUser()),
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Login
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(action.payload)
      );
    },

    // Logout
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;

export const selectIsAuthenticated = (state) =>
  state.auth.isAuthenticated;

export const selectUserRole = (state) =>
  state.auth.user?.role || state.auth.user?.Role || null;
