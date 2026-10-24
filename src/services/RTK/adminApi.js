
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://email-support-system-spi.vercel.app/api",
    credentials: "include",
  }),

  tagTypes: [
    "AdminTickets",
    "AdminUsers",
    "AdminAgents",
    "AdminDashboard",
    "Categories",
  ],

  endpoints: (builder) => ({
    // All tickets
    getAllTickets: builder.query({
      query: (params) => ({
        url: "/tickets/all-tickets",
        params,
      }),
      providesTags: ["AdminTickets"],
    }),

    // Unassigned tickets
    getUnassignedTickets: builder.query({
      query: () => "/tickets/unassigned",
      providesTags: ["AdminTickets"],
    }),

    // Admin dashboard
    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),

    // Assign ticket to agent
    assignTicket: builder.mutation({
      query: ({ ticketId, agentId }) => ({
        url: `/tickets/${ticketId}/assign`,
        method: "PATCH",
        body: { agentId },
      }),
      invalidatesTags: ["AdminTickets", "AdminDashboard"],
    }),

    // Get all users
    getUserList: builder.query({
      query: () => "/admin/userList",
      providesTags: ["AdminUsers"],
    }),


    // Get all support agents
    getAgentList: builder.query({
      query: () => "/admin/agentList",
      providesTags: ["AdminAgents"],
    }),

    // Promote user to support agent
    makeAgent: builder.mutation({
      query: (userId) => ({
        url: `/admin/makeAgent/${userId}`,
        method: "POST",
      }),
      invalidatesTags: [
        "AdminUsers",
        "AdminAgents",
        "AdminDashboard",
      ],
    }),

    // Remove support agent role
    removeAgent: builder.mutation({
      query: (userId) => ({
        url: `/admin/removeAgent/${userId}`,
        method: "POST",
      }),
      invalidatesTags: [
        "AdminUsers",
        "AdminAgents",
        "AdminDashboard",
      ],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/deleteUser/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "AdminUsers",
        "AdminAgents",
        "AdminDashboard",
      ],
    }),

    // Update user status
    updateUserStatus: builder.mutation({
      query: ({ userId, isActive }) => ({
        url: `/users/${userId}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["AdminUsers", "AdminAgents"],
    }),

    // Get categories
    getCategories: builder.query({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),

    // Create category
    createCategory: builder.mutation({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetAllTicketsQuery,
  useGetAdminDashboardQuery,
  useGetUnassignedTicketsQuery,
  useAssignTicketMutation,
  useGetUserListQuery,
  useGetAgentListQuery,
  useMakeAgentMutation,
  useRemoveAgentMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} = adminApi;
