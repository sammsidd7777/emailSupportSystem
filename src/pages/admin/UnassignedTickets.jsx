
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Headset,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Ticket,
  UserRound,
} from "lucide-react";

import {
  useUnassignTicketListQuery,
  useAssignTicketMutation,
} from "../../features/api/ticketApi";

import { useGetAgentListQuery } from "../../features/api/agentApi";
import { useToast } from "../../components/common/ToastProvider";

const getErrorMessage = (err, fallback) =>
  err?.data?.message ||
  err?.data?.error ||
  err?.error ||
  err?.message ||
  fallback;

const getTickets = (response) => {
  const result =
    response?.unAssinTicket ??
    response?.data?.unAssinTicket ??
    response?.tickets ??
    response?.data?.tickets ??
    response?.data ??
    response;

  return Array.isArray(result) ? result : [];
};

const getAgents = (response) => {
  const result =
    response?.agents ??
    response?.data?.agents ??
    response?.data ??
    response;

  return Array.isArray(result) ? result : [];
};

const getTicketId = (ticket) =>
  ticket?._id || ticket?.id || ticket?.TicketId;

const getTicketNumber = (ticket) =>
  ticket?.TicketNumber ||
  ticket?.ticketNumber ||
  ticket?.ticketId ||
  getTicketId(ticket);

const getSubject = (ticket) =>
  ticket?.Subject ||
  ticket?.subject ||
  ticket?.Title ||
  ticket?.title ||
  "No subject provided";

const getDescription = (ticket) =>
  ticket?.Description ||
  ticket?.description ||
  "No description available";

const getRequester = (ticket) =>
  ticket?.Requester?.Name ||
  ticket?.requester?.name ||
  ticket?.User?.Name ||
  ticket?.user?.name ||
  ticket?.Name ||
  ticket?.name ||
  ticket?.Email ||
  ticket?.email ||
  "Unknown requester";

const getPriority = (ticket) =>
  ticket?.Priority || ticket?.priority || "Normal";

const getCategory = (ticket) =>
  ticket?.Category?.Name ||
  ticket?.category?.name ||
  ticket?.Category ||
  ticket?.category ||
  "General";

const getCreatedDate = (ticket) => {
  const value =
    ticket?.CreatedAt ||
    ticket?.createdAt ||
    ticket?.created_at;

  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAgentId = (agent) => agent?._id || agent?.id;

const getAgentName = (agent) =>
  agent?.Name ||
  agent?.name ||
  agent?.FullName ||
  agent?.fullName ||
  agent?.Email ||
  agent?.email ||
  "Support Agent";

const priorityClass = (priority) => {
  const value = String(priority).toLowerCase();

  if (value === "urgent" || value === "critical") {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (value === "high") {
    return "border-orange-500/30 bg-orange-500/10 text-orange-400";
  }

  if (value === "low") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
};

export default function UnassignedTickets() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedAgents, setSelectedAgents] = useState({});
  const [assigningId, setAssigningId] = useState(null);

  const {
    data: ticketData,
    isLoading: ticketsLoading,
    isFetching: ticketsFetching,
    isError: ticketsError,
    refetch: refetchTickets,
  } = useUnassignTicketListQuery();

  const {
    data: agentData,
    isLoading: agentsLoading,
    isFetching: agentsFetching,
    isError: agentsError,
    refetch: refetchAgents,
  } = useGetAgentListQuery();

  const [assignTicket] = useAssignTicketMutation();

  const tickets = useMemo(
    () => getTickets(ticketData),
    [ticketData]
  );

  const agents = useMemo(
    () => getAgents(agentData),
    [agentData]
  );

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tickets;

    return tickets.filter((ticket) => {
      const searchableValues = [
        getTicketNumber(ticket),
        getSubject(ticket),
        getDescription(ticket),
        getRequester(ticket),
        getCategory(ticket),
        getPriority(ticket),
      ];

      return searchableValues.some((value) =>
        String(value).toLowerCase().includes(query)
      );
    });
  }, [tickets, search]);

  const handleAgentChange = (ticketId, agentId) => {
    setSelectedAgents((previous) => ({
      ...previous,
      [ticketId]: agentId,
    }));
  };

  const assignTickets = async (ticketId) => {
    const agentId = selectedAgents[ticketId];

    if (!ticketId) {
      toast.error("Ticket ID is missing.");
      return;
    }

    if (!agentId) {
      toast.error("Please select a support agent first.");
      return;
    }

    try {
      setAssigningId(ticketId);

      const response = await assignTicket({
        ticketId,
        agentId,
      }).unwrap();

      setSelectedAgents((previous) => {
        const updated = { ...previous };
        delete updated[ticketId];
        return updated;
      });

      toast.success(
        response?.message || "Ticket assigned successfully."
      );

      await refetchTickets();
    } catch (error) {
      console.error("Ticket assignment failed:", error);

      toast.error(
        getErrorMessage(
          error,
          "Ticket assignment failed. Please try again."
        )
      );
    } finally {
      setAssigningId(null);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchTickets().unwrap(),
        refetchAgents().unwrap(),
      ]);

      toast.success("Tickets and agents refreshed successfully.");
    } catch (error) {
      console.error("Refresh failed:", error);

      toast.error(
        getErrorMessage(
          error,
          "Unable to refresh tickets or agents."
        )
      );
    }
  };

  const isLoading = ticketsLoading || agentsLoading;
  const isRefreshing = ticketsFetching || agentsFetching;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#090909] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-yellow-400" />
          <p className="text-sm text-gray-400">
            Loading unassigned tickets...
          </p>
        </div>
      </div>
    );
  }

  if (ticketsError || agentsError) {
    return (
      <div className="min-h-[60vh] bg-[#090909] p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-[#111] p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />

          <h2 className="text-xl font-semibold">
            Unable to load data
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Please check your connection and try again.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-yellow-400">
              <Headset className="h-4 w-4" />
              <span>Support Management</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Unassigned Tickets
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Assign incoming tickets to the right support agent.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-gray-200 transition hover:border-yellow-400/40 hover:bg-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Unassigned Tickets
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {tickets.length}
                </p>
              </div>

              <div className="rounded-xl bg-yellow-400/10 p-3">
                <Ticket className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Available Agents
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {agents.length}
                </p>
              </div>

              <div className="rounded-xl bg-green-400/10 p-3">
                <UserCheck className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing Results
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {filteredTickets.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-400/10 p-3">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ticket, subject, requester..."
              className="w-full rounded-xl border border-white/10 bg-[#090909] py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/50"
            />
          </div>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/5"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Ticket List */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-semibold">Ticket Queue</h2>
              <p className="mt-1 text-xs text-gray-500">
                Review tickets and assign support agents.
              </p>
            </div>

            <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-400">
              {filteredTickets.length} tickets
            </span>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              </div>

              <h3 className="text-lg font-semibold">
                {search
                  ? "No matching tickets"
                  : "All caught up!"}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                {search
                  ? "Try another search term."
                  : "There are no unassigned tickets right now."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.07]">
              {filteredTickets.map((ticket) => {
                const ticketId = getTicketId(ticket);
                const priority = getPriority(ticket);
                const isAssigning = assigningId === ticketId;

                return (
                  <div
                    key={ticketId}
                    className="p-5 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      {/* Ticket Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/tickets/${ticketId}`)
                            }
                            className="font-semibold text-yellow-400 transition hover:text-yellow-300"
                          >
                            #{getTicketNumber(ticket)}
                          </button>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${priorityClass(
                              priority
                            )}`}
                          >
                            {priority}
                          </span>

                          <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-xs text-orange-300">
                            Unassigned
                          </span>
                        </div>

                        <h3 className="mt-3 break-words text-base font-semibold text-white">
                          {getSubject(ticket)}
                        </h3>

                        <p className="mt-1 line-clamp-2 break-words text-sm text-gray-400">
                          {getDescription(ticket)}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="h-3.5 w-3.5" />
                            {getRequester(ticket)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Ticket className="h-3.5 w-3.5" />
                            {getCategory(ticket)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {getCreatedDate(ticket)}
                          </span>
                        </div>
                      </div>

                      {/* Assignment Controls */}
                      <div className="flex w-full flex-col gap-3 rounded-xl border border-white/[0.07] bg-black/20 p-4 xl:w-[340px] xl:shrink-0">
                        <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                          Assign Support Agent
                        </label>

                        <select
                          value={selectedAgents[ticketId] || ""}
                          onChange={(event) =>
                            handleAgentChange(
                              ticketId,
                              event.target.value
                            )
                          }
                          disabled={isAssigning || agents.length === 0}
                          className="w-full rounded-xl border border-white/10 bg-[#171717] px-3 py-3 text-sm text-white outline-none focus:border-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">
                            {agents.length === 0
                              ? "No agents available"
                              : "Select an agent"}
                          </option>

                          {agents.map((agent) => (
                            <option
                              key={getAgentId(agent)}
                              value={getAgentId(agent)}
                            >
                              {getAgentName(agent)}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => assignTickets(ticketId)}
                          disabled={
                            isAssigning ||
                            !selectedAgents[ticketId] ||
                            agents.length === 0
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isAssigning ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4" />
                              Assign Ticket
                              <ChevronRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-400/10 bg-blue-400/[0.04] p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

          <p className="text-sm leading-6 text-gray-400">
            Assigning a ticket will remove it from this unassigned queue
            once the updated ticket data is received. Make sure you select
            the correct support agent before assigning.
          </p>
        </div>
      </div>
    </div>
  );
}
