import { useState } from "react";
import { toast } from "react-toastify";
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
        res?.message || ""
      );

      toast.success("Ticket assigned successfully.")

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
    low: "bg-neutral-100 text-neutral-600",
    medium: "bg-sky-50 text-sky-700",
    high: "bg-orange-50 text-orange-700",
    urgent: "bg-red-50 text-red-700",
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
    <div className="min-h-full">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#0f3d28] sm:text-5xl">
              Unassigned Tickets
            </h1>

            <p className="mt-2 text-sm text-neutral-500 sm:text-base">
              Assign pending tickets to the right support agent.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching || fetchingAgents}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0d3b27]/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 disabled:opacity-50"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b7048] via-[#115236] to-[#0a2e1e] p-5 text-white sm:p-6">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-white/10" />

            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-medium">
                Unassigned Tickets
              </p>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#0f3d28]">
                <Ticket size={20} />
              </span>
            </div>

            <p className="mt-4 text-5xl font-semibold tracking-tight">
              {unassignedCount}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-medium text-[#0f3d28]">
                Support Agents
              </p>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f7a4d]/10 text-[#1f7a4d]">
                <UserRoundPlus size={20} />
              </span>
            </div>

            <p className="mt-4 text-5xl font-semibold tracking-tight text-[#0f3d28]">
              {agents.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-medium text-[#0f3d28]">
                Urgent Tickets
              </p>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle size={20} />
              </span>
            </div>

            <p className="mt-4 text-5xl font-semibold tracking-tight text-[#0f3d28]">
              {urgentCount}
            </p>
          </div>
        </div>

        {/* Error message */}
        {(error || isError || agentError) && (
          <div
            role="alert"
            className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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
            className="flex items-center gap-2 rounded-3xl border border-[#1f7a4d]/30 bg-[#1f7a4d]/10 p-4 text-sm font-medium text-[#0f3d28]"
          >
            <CheckCircle2 size={18} className="text-[#1f7a4d]" />
            {success}
          </div>
        )}

        {/* Search and priority filter */}
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 sm:flex-row sm:p-5">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket number, subject, or email..."
              className="w-full rounded-full border border-neutral-200 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 hover:border-[#1f7a4d]/50 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
            />
          </div>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-full border border-neutral-200 bg-[#f7f7f5] px-5 py-3 text-sm font-medium text-neutral-700 outline-none transition hover:border-[#1f7a4d]/50 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Tickets table */}
        <div className="overflow-hidden rounded-3xl bg-white">
          {loadingTickets ? (
            <div className="flex items-center justify-center gap-3 p-12 text-neutral-500">
              <RefreshCw
                size={18}
                className="animate-spin text-[#1f7a4d]"
              />
              Loading unassigned tickets...
            </div>
          ) : isError && tickets.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle
                className="mx-auto mb-3 text-red-400"
                size={40}
              />

              <h3 className="font-semibold text-neutral-800">
                Unable to load tickets
              </h3>

              <button
                type="button"
                onClick={() => refetchTickets()}
                className="mt-4 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Try Again
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#1f7a4d]/10 text-[#1f7a4d]">
                <Ticket size={28} />
              </div>

              <h3 className="font-semibold text-neutral-800">
                No unassigned tickets found
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                All matching tickets may already be assigned.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto p-3 sm:p-4">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#f7f7f5] text-xs text-neutral-500">
                  <tr>
                    <th className="rounded-l-2xl px-5 py-3.5 font-medium">
                      Ticket
                    </th>
                    <th className="px-5 py-3.5 font-medium">Requester</th>
                    <th className="px-5 py-3.5 font-medium">Priority</th>
                    <th className="px-5 py-3.5 font-medium">Created</th>
                    <th className="px-5 py-3.5 font-medium">
                      Assign Agent
                    </th>
                    <th className="rounded-r-2xl px-5 py-3.5 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
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
                        className="transition hover:bg-[#f7f7f5]"
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
                            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50"
                          >
                            <span className="rounded-full bg-[#1f7a4d]/10 px-2.5 py-1 text-xs font-bold text-[#1f7a4d] hover:bg-[#1f7a4d]/20">
                              {ticketNumber}
                            </span>

                           
                          </button>
                        </td>

                        {/* Requester */}
                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {requesterEmail}
                        </td>

                        {/* Priority */}
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              priorityStyle[ticketPriority] ||
                              "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {ticketPriority}
                          </span>
                        </td>

                        {/* Created date */}
                        <td className="px-5 py-4 text-sm text-neutral-500">
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
                            className="w-56 rounded-full border border-neutral-200 bg-[#f7f7f5] px-4 py-2.5 text-sm text-neutral-700 outline-none transition hover:border-[#1f7a4d]/50 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0d3b27]/15 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 disabled:cursor-not-allowed disabled:bg-none disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
                          >
                            {assigningId === ticketId && (
                              <RefreshCw
                                size={14}
                                className="animate-spin"
                              />
                            )}
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
        <p className="px-1 text-sm text-neutral-500">
          Showing{" "}
          <strong className="text-[#0f3d28]">
            {filteredTickets.length}
          </strong>{" "}
          of{" "}
          <strong className="text-[#0f3d28]">{tickets.length}</strong>{" "}
          tickets
        </p>
      </div>
    </div>
  );
}