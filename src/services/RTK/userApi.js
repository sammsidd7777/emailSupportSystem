
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://email-support-system-spi.vercel.app/api",
    credentials: "include",
  }),

  tagTypes: ["UserProfile", "UserTickets", "Ticket", "TicketMessage"],

  endpoints: (builder) => ({
   

    // Update name and phone
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/users/profile",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserProfile"],
    }),

 // Get logged-in user's profile
    getProfile: builder.query({
      query: () => "/users/profile",
      providesTags: ["UserProfile"],
    }),

    // Request email change OTP
    updateEmail: builder.mutation({
      query: (body) => ({
        url: "/users/profile/email/change-request",
        method: "POST",
        body,
      }),
    }),

    // Verify email OTP
    verifyEmailOtp: builder.mutation({
      query: (body) => ({
        url: "/users/profile/email/verify-otp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserProfile"],
    }),

    // Change password
    // Confirm this URL matches your backend route.
    changePassword: builder.mutation({
      query: (body) => ({
        url: "/users/profile/password/change",
        method: "POST",
        body,
      }),
    }),

    // Create ticket
    createTicket: builder.mutation({
      query: (body) => ({
        url: "/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserTickets"],
    }),

    // Get logged-in user's tickets
    getMyTickets: builder.query({
      query: (params) => ({
        url: "/tickets/my-tickets",
        params,
      }),
      providesTags: ["UserTickets"],
    }),

    // Get ticket details
    getTicketById: builder.query({
      query: (ticketId) => `/tickets/${ticketId}`,
      providesTags: (result, error, id) => [
        { type: "Ticket", id },
      ],
    }),

    // Send ticket message
    sendTicketMessage: builder.mutation({
      query: ({ ticketId, ...body }) => ({
        url: `/tickets/${ticketId}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Ticket", id: ticketId },
        "TicketMessage",
      ],
    }),

    // User replies to a ticket
    userReplyToTicket: builder.mutation({
      query: ({ ticketId, message }) => ({
        url: `/users/${ticketId}/reply`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: ["TicketMessage", "Ticket"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateEmailMutation,
  useVerifyEmailOtpMutation,
  useChangePasswordMutation,
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useSendTicketMessageMutation,
  useUserReplyToTicketMutation,
} = userApi;
