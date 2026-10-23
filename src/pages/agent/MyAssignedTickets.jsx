
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useGetMyAssignedTicketsQuery } from "../../services/RTK/agentApi";

export default function MyAssignedTickets() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetMyAssignedTicketsQuery();

  const tickets = Array.isArray(data?.tickets)
    ? data.tickets
    : Array.isArray(data?.data?.tickets)
    ? data.data.tickets
    : [];

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const q = search.toLowerCase();

      const matchesSearch =
        (ticket.subject || "").toLowerCase().includes(q) ||
        (ticket.ticketNumber || "").toLowerCase().includes(q) ||
        (ticket.description || "").toLowerCase().includes(q);

      const matchesStatus =
        status === "all" ||
        (ticket.status || "open").toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, status]);

  const statusStyle = (value) => {
    switch ((value || "open").toLowerCase()) {
      case "resolved":
        return "bg-emerald-50 text-emerald-700";
      case "in progress":
        return "bg-blue-50 text-blue-700";
      case "closed":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const priorityStyle = (value) => {
    switch ((value || "low").toLowerCase()) {
      case "urgent":
        return "bg-red-50 text-red-700";
      case "high":
        return "bg-orange-50 text-orange-700";
      case "medium":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const openTicket = (id) => {
    navigate(`/agent/tickets/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              AGENT WORKSPACE
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              My Assigned Tickets
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View and manage tickets assigned to your account.
            </p>
          </div>

          <button
            onClick={refetch}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Assigned Tickets"
            value={tickets.length}
            icon={<Ticket size={21} />}
            color="bg-indigo-50 text-indigo-600"
          />
          <SummaryCard
            title="In Progress"
            value={tickets.filter(
              (t) => (t.status || "").toLowerCase() === "in progress"
            ).length}
            icon={<Clock3 size={21} />}
            color="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            title="Resolved"
            value={tickets.filter(
              (t) => (t.status || "").toLowerCase() === "resolved"
            ).length}
            icon={<CheckCircle2 size={21} />}
            color="bg-emerald-50 text-emerald-600"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject, ticket number..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">Ticket List</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredTickets.length} ticket(s)
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center gap-3 p-12 text-slate-500">
              <RefreshCw className="animate-spin" size={20} />
              Loading assigned tickets...
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertCircle className="mx-auto text-red-500" size={32} />
              <p className="mt-3 font-semibold">Could not load tickets</p>
              <button
                onClick={refetch}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket size={34} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">
                No tickets found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Assigned tickets will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <article
                  key={ticket._id}
                  className="flex flex-col justify-between gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        {ticket.TicketNumber || ticket._id}
                      </span>
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyle(ticket.priority)}`}
                      >
                        {ticket.Priority || "Low"}
                      </span>
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(ticket.status)}`}
                      >
                        {ticket.Status || "Open"}
                      </span>
                    </div>

                    <h3 className="mt-3 break-words font-bold text-slate-900">
                      {ticket?.Subject || "Untitled ticket"}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                      {ticket.Description || "No description provided."}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Created{" "}
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleString()
                        : "date unavailable"}
                    </p>
                  </div>

                  <button
                    onClick={() => openTicket(ticket._id)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    View Details
                    <ChevronRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className={`rounded-xl p-3 ${color}`}>{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
