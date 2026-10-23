
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
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  const statusClasses = {
    open: "bg-blue-100 text-blue-700",
    "in-progress": "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-200 text-gray-700",
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              All Tickets
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and manage all customer support tickets.
            </p>
          </div>

          <button
            onClick={refetch}
            disabled={isFetching}
            className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Tickets"
            value={data?.totalCount ?? tickets.length}
            icon={<Ticket size={22} />}
          />
          <StatCard
            title="Open Tickets"
            value={openCount}
            icon={<AlertCircle size={22} />}
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock size={22} />}
          />
          <StatCard
            title="Resolved"
            value={resolvedCount}
            icon={<CheckCircle size={22} />}
          />
        </div>

        {isError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
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

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket, subject, email..."
              className="w-full rounded-lg border bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
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
            className="rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />
              <h3 className="font-semibold text-gray-800">
                No tickets found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Ticket</th>
                    <th className="px-5 py-4">Requester</th>
                    <th className="px-5 py-4">Assigned Agent</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
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
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-blue-600">
                            {ticketNumber}
                          </p>
                          <p className="mt-1 max-w-xs truncate text-sm text-gray-600">
                            {subject}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          <p>{requesterName}</p>
                          <p>{requesterEmail}</p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {agentName}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              priorityClasses[ticketPriority] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {ticketPriority}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusClasses[ticketStatus] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {ticketStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {createdAt
                            ? new Date(createdAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              navigate(`/admin/tickets/${ticket._id}`)
                            }
                            className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
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

        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between text-gray-500">
        <span className="text-sm">{title}</span>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}
