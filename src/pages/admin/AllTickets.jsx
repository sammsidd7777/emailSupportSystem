import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useGetAllTicketsQuery } from "../../services/RTK/adminApi";

export default function AllTickets() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllTicketsQuery();

  // Backend returns: { totalTicket, assignTicket, unAssinTicket }
  const tickets = Array.isArray(data?.totalTicket)
    ? data.totalTicket
    : [];

  const filteredTickets = tickets.filter((ticket) => {
    const query = search.toLowerCase();

    const requesterEmail =
      ticket.RequesterEmail ||
      ticket.requesterEmail ||
      ticket.RequesterId?.Email ||
      ticket.requesterId?.email ||
      "";

    const ticketNumber = String(
      ticket.TicketNumber || ticket.ticketNumber || ""
    );

    const subject = String(
      ticket.Subject || ticket.subject || ""
    );

    const ticketStatus = String(
      ticket.Status || ticket.status || ""
    ).toLowerCase();

    const ticketPriority = String(
      ticket.Priority || ticket.priority || ""
    ).toLowerCase();

    const matchesSearch =
      ticketNumber.toLowerCase().includes(query) ||
      subject.toLowerCase().includes(query) ||
      requesterEmail.toLowerCase().includes(query);

    const matchesStatus =
      status === "all" || ticketStatus === status;

    const matchesPriority =
      priority === "all" || ticketPriority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatus = (ticket) =>
    String(ticket.Status || ticket.status || "open").toLowerCase();

  const getPriority = (ticket) =>
    String(ticket.Priority || ticket.priority || "medium").toLowerCase();

  const openCount = tickets.filter(
    (ticket) => getStatus(ticket) === "open"
  ).length;

  const inProgressCount = tickets.filter(
    (ticket) => getStatus(ticket) === "in-progress"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => getStatus(ticket) === "resolved"
  ).length;

  const priorityClasses = {
    low: "bg-neutral-100 text-neutral-600",
    medium: "bg-sky-50 text-sky-700",
    high: "bg-orange-50 text-orange-700",
    urgent: "bg-red-50 text-red-700",
  };

  const statusClasses = {
    open: "bg-sky-50 text-sky-700 ring-sky-200",
    "in-progress": "bg-amber-50 text-amber-700 ring-amber-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    closed: "bg-neutral-100 text-neutral-500 ring-neutral-200",
  };

  const getRequester = (ticket) => {
    const requester =
      ticket.RequesterId || ticket.requesterId;

    return requester && typeof requester === "object"
      ? requester
      : null;
  };

  const getAgent = (ticket) => {
    const agent =
      ticket.AssignedTo || ticket.assignedTo;

    return agent && typeof agent === "object"
      ? agent
      : null;
  };

  return (
    <div className="min-h-full">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#0f3d28] sm:text-5xl">
              All Tickets
            </h1>
            <p className="mt-2 text-sm text-neutral-500 sm:text-base">
              Monitor and manage all customer support tickets.
            </p>
          </div>

          <button
            onClick={refetch}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0d3b27]/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            featured
            title="Total Tickets"
            value={data?.totalCount ?? tickets.length}
            icon={<Ticket size={20} />}
          />
          <StatCard
            title="Open Tickets"
            value={openCount}
            icon={<AlertCircle size={20} />}
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock size={20} />}
          />
          <StatCard
            title="Resolved"
            value={resolvedCount}
            icon={<CheckCircle size={20} />}
          />
        </div>

        {isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error?.data?.message ||
              error?.error ||
              "Failed to load tickets. Please try again."}
            <button
              onClick={refetch}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 rounded-3xl bg-white p-4 sm:p-5 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket, subject, email..."
              className="w-full rounded-full border border-neutral-200 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 hover:border-[#1f7a4d]/50 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-full border border-neutral-200 bg-[#f7f7f5] px-5 py-3 text-sm font-medium text-neutral-700 outline-none transition hover:border-[#1f7a4d]/50 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

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

        <div className="overflow-hidden rounded-3xl bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 p-12 text-neutral-500">
              <RefreshCw
                size={18}
                className="animate-spin text-[#1f7a4d]"
              />
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#1f7a4d]/10 text-[#1f7a4d]">
                <Ticket size={28} />
              </div>
              <h3 className="font-semibold text-neutral-800">
                No tickets found
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto p-3 sm:p-4">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-[#f7f7f5] text-xs text-neutral-500">
                  <tr>
                    <th className="rounded-l-2xl px-5 py-3.5 font-medium">
                      Ticket
                    </th>
                    <th className="px-5 py-3.5 font-medium">Requester</th>
                    <th className="px-5 py-3.5 font-medium">
                      Assigned Agent
                    </th>
                    <th className="px-5 py-3.5 font-medium">Priority</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium">Created</th>
                    <th className="rounded-r-2xl px-5 py-3.5 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {filteredTickets.map((ticket) => {
                    const requester = getRequester(ticket);
                    const agent = getAgent(ticket);
                    const ticketStatus = getStatus(ticket);
                    const ticketPriority = getPriority(ticket);

                    const ticketNumber =
                      ticket.TicketNumber ||
                      ticket.ticketNumber ||
                      ticket._id;

                    const subject =
                      ticket.Subject ||
                      ticket.subject ||
                      "Untitled ticket";

                    const requesterEmail =
                      ticket.RequesterEmail ||
                      ticket.requesterEmail ||
                      requester?.Email ||
                      requester?.email ||
                      "—";

                    const requesterName =
                      requester?.Name ||
                      requester?.name ||
                      "Customer";

                    const agentName =
                      agent?.Name ||
                      agent?.name ||
                      (agent ? "Assigned" : "Unassigned");

                    const createdAt =
                      ticket.CreatedAt || ticket.createdAt;

                    return (
                      <tr
                        key={ticket._id}
                        className="transition hover:bg-[#f7f7f5]"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#1f7a4d]/10 px-2.5 py-1 text-xs font-bold text-[#1f7a4d]">
                            {ticketNumber}
                          </span>
                        
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          <p className="font-medium text-neutral-800">
                            {requesterName}
                          </p>
                          <p className="text-neutral-500">
                            {requesterEmail}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {agentName}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              priorityClasses[ticketPriority] ||
                              "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {ticketPriority}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                              statusClasses[ticketStatus] ||
                              "bg-neutral-100 text-neutral-500 ring-neutral-200"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {ticketStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-500">
                          {createdAt
                            ? new Date(createdAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              navigate(`/admin/tickets/${ticket._id}`)
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-[#1f7a4d]/50 px-4 py-2 text-sm font-semibold text-[#0f3d28] transition hover:bg-[#0f3d28] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50"
                          >
                            <Eye size={16} />
                            View
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

function StatCard({ title, value, icon, featured = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 ${
        featured
          ? "bg-gradient-to-br from-[#1b7048] via-[#115236] to-[#0a2e1e] text-white"
          : "bg-white text-[#0f3d28]"
      }`}
    >
      {featured && (
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-white/10" />
      )}

      <div className="flex items-start justify-between gap-3">
        <span className="text-base font-medium">{title}</span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            featured
              ? "bg-white text-[#0f3d28]"
              : "bg-[#1f7a4d]/10 text-[#1f7a4d]"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-5xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}