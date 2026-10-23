
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ticketApi = createApi({
  reducerPath: "ticketApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api",
    credentials: "include",
  }),

  tagTypes: ["Tickets"],

  endpoints: (builder) => ({
    createTicket: builder.mutation({
      query: (ticketData) => ({
        url: "/tickets",
        method: "POST",
        body: ticketData,
      }),
      invalidatesTags: ["Tickets"],
    }),

    getMyTickets: builder.query({
      query: () => "/tickets/my-tickets",
      method:"GET",
      providesTags: ["Tickets"],
    }),
      allTickets: builder.query({
      query: () => "/tickets/all-tickets",
      method:"GET",
      providesTags: ["Tickets"],
    }),

    getTicketById: builder.query({
      query: (id) => `/tickets/${id}`,
      providesTags: ["Tickets"],
    }),

   assignTicket: builder.mutation({
  query: ({ ticketId,agentId  }) => ({
    url: `/tickets/${ticketId}/assign`,
    method: "PATCH",
    body: { agentId },
  }),
}), 
    unassignTicket: builder.query({
        query:(id)=>`/tickets/:${id}/unassign`
    }),

    assignTicketList: builder.query({
      query: () => "/tickets/assigned-tickets",
    }),
    unassignTicketList: builder.query({
      query: () => "/tickets/unassigned-tickets",
    }),
  }),
});

  
  

export const {
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useAllTicketsQuery,
  useAssignTicketListQuery,
  useUnassignTicketListQuery,
  useAssignTicketQuery,
  useUnassignTicketQuery,
} = ticketApi;
