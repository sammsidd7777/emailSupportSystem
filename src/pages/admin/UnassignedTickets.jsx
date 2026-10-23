
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserRoundPlus,
  RefreshCw,
  Ticket,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useUnassignTicketListQuery } from "../../services/RTK/ticketApi";
import {
  useAssignTicketMutation,
  useGetAgentListQuery,
} from "../../services/RTK/adminApi";

export default function UnassignedTickets() {
  const navigate = useNavigate();

  // UI states
  const [selectedAgents, setSelectedAgents] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");

  // Ticket list API
  const {
    data: ticketData,
    isLoading: loadingTickets,
    isFetching,
    isError,
    error: queryError,
    refetch: refetchTickets,
  } = useUnassignTicketListQuery();

  // Support agents API
  const {
    data: agentData,
    isLoading: loadingAgents,
    isFetching: fetchingAgents,
    isError: agentError,
    error: agentQueryError,
    refetch: refetchAgents,
  } = useGetAgentListQuery();

  // Assign ticket mutation
  const [assignTicket] = useAssignTicketMutation();

  // Normalize ticket response
  const tickets = Array.isArray(ticketData?.unAssinTicket)
    ? ticketData.unAssinTicket
    : Array.isArray(ticketData?.data?.unAssinTicket)
      ? ticketData.data.unAssinTicket
      : Array.isArray(ticketData?.tickets)
        ? ticketData.tickets
        : Array.isArray(ticketData?.data?.tickets)
          ? ticketData.data.tickets
          : Array.isArray(ticketData?.data)
            ? ticketData.data
            : Array.isArray(ticketData)
              ? ticketData
              : [];

  // Normalize agent response
  const agents = Array.isArray(agentData?.agents)
    ? agentData.agents
    : Array.isArray(agentData?.data?.agents)
      ? agentData.data.agents
      : Array.isArray(agentData?.data)
        ? agentData.data
        : Array.isArray(agentData)
          ? agentData
          : [];

  // Refresh tickets and agents
  const handleRefresh = async () => {
    setError("");
    setSuccess("");

    try {
      await Promise.all([
        refetchTickets().unwrap(),
        refetchAgents().unwrap(),
      ]);
    } catch (err) {
      setError(
        err?.data?.message ||
          "Unable to refresh tickets or agents."
      );
    }
  };

  // Handle agent selection separately for each ticket
  const handleAgentChange = (ticketId, agentId) => {
    setSelectedAgents((prev) => ({
      ...prev,
      [ticketId]: agentId,
    }));

    setError("");
    setSuccess("");
  };

  // Assign selected agent to a ticket
  const assignTickets = async (ticketId) => {
    const agentId = selectedAgents[ticketId];

    if (!ticketId) {
      setError("Ticket ID is missing.");
      setSuccess("");
      return;
    }

    if (!agentId) {
      setError("Please select a support agent first.");
      setSuccess("");
      return;
    }

    try {
      setAssigningId(ticketId);
      setError("");
      setSuccess("");

      // Verify exact IDs before API request
      console.log("Assign ticket payload:", {
        ticketId,
        agentId,
      });

      const res = await assignTicket({
        ticketId,
        agentId,
      }).unwrap();

      setSuccess(
        res?.message || "Ticket assigned successfully."
      );

      // Clear selected agent for this ticket
      setSelectedAgents((prev) => {
        const updated = { ...prev };
        delete updated[ticketId];
        return updated;
      });

      // Refresh unassigned ticket list
      await refetchTickets().unwrap();
    } catch (err) {
      console.error("Ticket assignment failed:", err);

      setError(
        err?.data?.message ||
          err?.data?.error ||
          err?.error ||
          err?.message ||
          "Ticket assignment failed."
      );
    } finally {
      setAssigningId(null);
    }
  };

  // Search and priority filtering
  const filteredTickets = tickets.filter((ticket) => {
    const query = search.toLowerCase().trim();

    const ticketNumber = String(
      ticket.ticketNumber ||
        ticket.TicketNumber ||
        ticket._id ||
        ""
    );

    const subject = String(
      ticket.subject || ticket.Subject || ""
    );

    const requesterEmail = String(
      ticket.requesterEmail ||
        ticket.RequesterEmail ||
        ticket.requesterId?.email ||
        ticket.RequesterId?.Email ||
        ""
    );

    const ticketPriority = String(
      ticket.priority || ticket.Priority || "medium"
    ).toLowerCase();

    const matchesSearch =
      ticketNumber.toLowerCase().includes(query) ||
      subject.toLowerCase().includes(query) ||
      requesterEmail.toLowerCase().includes(query);

    const matchesPriority =
      priority === "all" || ticketPriority === priority;

    return matchesSearch && matchesPriority;
  });

  const priorityStyle = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  const urgentCount = tickets.filter(
    (ticket) =>
      String(
        ticket.priority || ticket.Priority || "medium"
      ).toLowerCase() === "urgent"
  ).length;

  const unassignedCount =
    ticketData?.unassignedCount ??
    ticketData?.data?.unassignedCount ??
    tickets.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Unassigned Tickets
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Assign pending tickets to the right support agent.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching || fetchingAgents}
            className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                isFetching || fetchingAgents
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Unassigned Tickets
              </p>
              <Ticket size={22} className="text-blue-600" />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {unassignedCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Support Agents
              </p>
              <UserRoundPlus
                size={22}
                className="text-green-600"
              />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {agents.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Urgent Tickets
              </p>
              <AlertCircle
                size={22}
                className="text-red-600"
              />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {urgentCount}
            </p>
          </div>
        </div>

        {/* Error message */}
        {(error || isError || agentError) && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error ||
              queryError?.data?.message ||
              agentQueryError?.data?.message ||
              queryError?.error ||
              agentQueryError?.error ||
              "Unable to load tickets or support agents."}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* Search and priority filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket number, subject, or email..."
              className="w-full rounded-lg border bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Tickets table */}
        <div className="overflow-hidden rounded-xl border bg-white">
          {loadingTickets ? (
            <div className="p-12 text-center text-gray-500">
              Loading unassigned tickets...
            </div>
          ) : isError && tickets.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle
                className="mx-auto mb-3 text-red-400"
                size={40}
              />

              <h3 className="font-semibold text-gray-800">
                Unable to load tickets
              </h3>

              <button
                type="button"
                onClick={() => refetchTickets()}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket
                className="mx-auto mb-3 text-gray-300"
                size={40}
              />

              <h3 className="font-semibold text-gray-800">
                No unassigned tickets found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                All matching tickets may already be assigned.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Ticket</th>
                    <th className="px-5 py-4">Requester</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4">Assign Agent</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.map((ticket) => {
                    const ticketId = ticket._id;

                    const ticketNumber =
                      ticket.ticketNumber ||
                      ticket.TicketNumber ||
                      ticketId;

                    const subject =
                      ticket.subject ||
                      ticket.Subject ||
                      "Untitled ticket";

                    const requesterEmail =
                      ticket.requesterEmail ||
                      ticket.RequesterEmail ||
                      ticket.requesterId?.email ||
                      ticket.RequesterId?.Email ||
                      "N/A";

                    const ticketPriority = String(
                      ticket.priority ||
                        ticket.Priority ||
                        "medium"
                    ).toLowerCase();

                    const createdAt =
                      ticket.createdAt || ticket.CreatedAt;

                    return (
                      <tr
                        key={ticketId}
                        className="hover:bg-gray-50"
                      >
                        {/* Ticket details */}
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/tickets/${ticketId}`
                              )
                            }
                            className="text-left"
                          >
                            <p className="font-semibold text-blue-600 hover:underline">
                              {ticketNumber}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-sm text-gray-600">
                              {subject}
                            </p>
                          </button>
                        </td>

                        {/* Requester */}
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {requesterEmail}
                        </td>

                        {/* Priority */}
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              priorityStyle[ticketPriority] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {ticketPriority}
                          </span>
                        </td>

                        {/* Created date */}
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {createdAt
                            ? new Date(
                                createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        {/* Agent dropdown */}
                        <td className="px-5 py-4">
                          <select
                            value={
                              selectedAgents[ticketId] || ""
                            }
                            onChange={(e) =>
                              handleAgentChange(
                                ticketId,
                                e.target.value
                              )
                            }
                            disabled={
                              loadingAgents ||
                              agents.length === 0 ||
                              assigningId === ticketId
                            }
                            className="w-52 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                          >
                            <option value="">
                              {loadingAgents
                                ? "Loading agents..."
                                : agents.length === 0
                                  ? "No agents available"
                                  : "Select agent"}
                            </option>

                            {agents.map((agent) => {
                              const agentId = agent._id;

                              const agentName =
                                agent.name ||
                                agent.Name ||
                                agent.fullName ||
                                agent.FullName ||
                                agent.email ||
                                agent.Email ||
                                "Unnamed agent";

                              const agentEmail =
                                agent.email ||
                                agent.Email ||
                                "No email";

                              return (
                                <option
                                  key={agentId}
                                  value={agentId}
                                >
                                  {agentName} ({agentEmail})
                                </option>
                              );
                            })}
                          </select>
                        </td>

                        {/* Assign button */}
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={
                              assigningId === ticketId ||
                              loadingAgents ||
                              agents.length === 0 ||
                              !selectedAgents[ticketId]
                            }
                            onClick={() =>
                              assignTickets(ticketId)
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {assigningId === ticketId
                              ? "Assigning..."
                              : "Assign"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </p>
      </div>
    </div>
  );
}
