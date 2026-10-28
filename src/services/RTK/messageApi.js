
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = (
 "https://email-support-system-spi.vercel.app/api"
).replace(/\/$/, "");

export const messageApi = createApi({
  reducerPath: "messageApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/`,
    credentials: "include",

    prepareHeaders: (headers) => {
      // Use this if your JWT is stored in localStorage.
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["AgentTickets", "AgentProfile"],

  endpoints: (builder) => ({
   

   

    // Update ticket status
    createMessage: builder.mutation({
        query: ({ ticketId, message }) => ({
            url: `/messages/tickets/${ticketId}`,
            method: "POST",
            body: { message },
        }),
        invalidatesTags: (result, error, { ticketId }) => [
            { type: "AgentTickets", id: ticketId },
            "AgentTickets",
        ],
    }),

    getMessagesByTicketId: builder.query({
      query: (ticketId) => `/messages/tickets/${ticketId}/messages`,
      providesTags: (result, error, ticketId) => [
        { type: "AgentTickets", id: ticketId },
      ],
    }),

    // Get logged-in agent profile
   
  }),
});

export const {
useGetMessagesByTicketIdQuery,
useCreateMessageMutation,
} = messageApi;
