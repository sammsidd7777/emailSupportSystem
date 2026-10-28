
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = (
"https://email-support-system-spi.vercel.app/api"
).replace(/\/$/, "");

export const agentApi = createApi({
  reducerPath: "agentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/agent`,
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
    // Get logged-in agent's assigned tickets
    getMyAssignedTickets: builder.query({
      query: () => "/tickets",
      providesTags: ["AgentTickets"],
    }),

    // Get details of one assigned ticket
    getAgentTicketById: builder.query({
      query: (ticketId) => `/tickets/${ticketId}`,
      providesTags: (result, error, ticketId) => [
        { type: "AgentTickets", id: ticketId },
      ],
    }),

    // Reply to a ticket
    replyToTicket: builder.mutation({
      query: ({ ticketId, message }) => ({
        url: `/tickets/${ticketId}/reply`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "AgentTickets", id: ticketId },
        "AgentTickets",
      ],
    }),

    // Update ticket status
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: `/tickets/${ticketId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AgentTickets"],
    }),

    // Get logged-in agent profile
    getAgentProfile: builder.query({
      query: () => "/profile",
      providesTags: ["AgentProfile"],
    }),
  }),
});

export const {
  useGetMyAssignedTicketsQuery,
  useGetAgentTicketByIdQuery,
  useReplyToTicketMutation,
  useUpdateTicketStatusMutation,
  useGetAgentProfileQuery,
} = agentApi;
