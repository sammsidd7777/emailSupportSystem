
import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "../services/RTK/authApi";
import { userApi } from "../services/RTK/userApi";
import { agentApi } from "../services/RTK/agentApi";
import { adminApi } from "../services/RTK/adminApi";
import { ticketApi } from "../services/RTK/ticketApi";
import { messageApi } from "../services/RTK/messageApi";

import authReducer from "../services/authSlice";

export const store = configureStore({
  reducer: {
    // RTK Query reducers
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [agentApi.reducerPath]: agentApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,

    // Normal Redux reducer
    auth: authReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      agentApi.middleware,
      adminApi.middleware,
      ticketApi.middleware,
      messageApi.middleware
    ),
});
