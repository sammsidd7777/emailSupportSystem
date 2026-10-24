
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://email-support-system-spi.vercel.app/api",
    credentials: "include",
  }),

  tagTypes: ["UserProfile", "UserTickets", "Ticket"],

  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/users/profile",
      providesTags: ["UserProfile"],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/users/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["UserProfile"],
    }),

    createTicket: builder.mutation({
      query: (body) => ({
        url: "/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserTickets"],
    }),

    getMyTickets: builder.query({
      query: (params) => ({
        url: "/tickets/my-tickets",
        params,
      }),
      providesTags: ["UserTickets"],
    }),

    getTicketById: builder.query({
      query: (ticketId) => `/tickets/${ticketId}`,
      providesTags: (result, error, id) => [
        { type: "Ticket", id },
      ],
    }),

    sendTicketMessage: builder.mutation({
      query: ({ ticketId, ...body }) => ({
        url: `/tickets/${ticketId}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
      ],
    }),

    userReplyToTicket: builder.mutation({
      query: ({ ticketId, message }) => ({
        url: `user/${ticketId}/reply`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: ["TicketMessage"],
    }),

    
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useSendTicketMessageMutation,
  useUserReplyToTicketMutation
} = userApi;
