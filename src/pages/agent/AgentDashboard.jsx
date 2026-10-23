
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Search,
  RefreshCw,
  ArrowUpRight,
  CalendarDays,
  Filter,
  RotateCcw,
  Inbox,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  CircleDot,
  Headset,
  X,
} from "lucide-react";

import { useGetMyAssignedTicketsQuery } from "../../services/RTK/agentApi";

const normalize = (value) =>
  String(value || "open")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");

const getStatus = (ticket) =>
  normalize(ticket.status || ticket.Status);

const getPriority = (ticket) =>
  normalize(ticket.priority || ticket.Priority || "medium");

const getTicketNumber = (ticket) =>
  ticket.ticketNumber ||
  ticket.TicketNumber ||
  `#${String(ticket._id || "").slice(-6).toUpperCase()}`;

const getCustomer = (ticket) =>
  ticket.requesterEmail ||
  ticket.RequesterEmail ||
  ticket.requesterId?.email ||
  ticket.requesterId?.Email ||
  ticket.RequesterId?.email ||
  ticket.RequesterId?.Email ||
  "Customer";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusStyles = {
  open: "bg-blue-50 text-blue-700 ring-blue-200",
  "in progress": "bg-amber-50 text-amber-700 ring-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

const priorityStyles = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
};

function Badge({ value, styles }) {
  const label = value.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        styles[value] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconStyle,
  description,
  loading,
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${iconStyle}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <p className="text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}

function FilterSelect({ value, onChange, label, children }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    >
      {children}
    </select>
  );
}

export default function AgentDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMyAssignedTicketsQuery();

  const tickets = useMemo(() => {
    if (Array.isArray(data?.tickets)) return data.tickets;
    if (Array.isArray(data?.data?.tickets)) return data.data.tickets;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

 const stats = useMemo(
  () => ({
    total: data?.stats?.total ?? 0,
    open: data?.stats?.open ?? 0,
    progress: data?.stats?.progress ?? 0,
    resolved: data?.stats?.resolved ?? 0,
    closed: data?.stats?.closed ?? 0,
    urgent: data?.stats?.urgent ?? 0,
  }),
  [data?.stats]
);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const number = String(getTicketNumber(ticket)).toLowerCase();
      const subject = String(
        ticket.subject || ticket.Subject || ""
      ).toLowerCase();
      const customer = String(getCustomer(ticket)).toLowerCase();

      return (
        (number.includes(query) ||
          subject.includes(query) ||
          customer.includes(query)) &&
        (statusFilter === "all" ||
          getStatus(ticket) === statusFilter) &&
        (priorityFilter === "all" ||
          getPriority(ticket) === priorityFilter)
      );
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const hasFilters =
    search !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  const openTicket = (ticket) => {
    if (ticket?._id) {
      navigate(`/agent/tickets/${ticket._id}`);
    }
  };

  return (
    <div className="min-h-full space-y-7 bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <span className="text-blue-600">Dashboard</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Agent Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your workload and keep customer requests moving.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60 sm:self-center"
        >
          <RefreshCw
            size={16}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh data
        </button>
      </section>

      {/* Hero banner */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full border-[40px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 -z-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
              <Headset size={15} />
              SUPPORT WORKSPACE
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Welcome back, Agent!
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/90 sm:text-base">
              Every ticket is an opportunity to help. Review your
              assignments, prioritize urgent issues, and keep customers
              informed.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5">
                <Ticket size={17} className="text-cyan-200" />
                <div>
                  <p className="text-lg font-bold leading-5">
                    {isLoading ? "—" : stats.total}
                  </p>
                  <p className="mt-1 text-[11px] text-blue-100">
                    Assigned tickets
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5">
                <Clock3 size={17} className="text-amber-200" />
                <div>
                  <p className="text-lg font-bold leading-5">
                    {isLoading ? "—" : stats.open + stats.progress}
                  </p>
                  <p className="mt-1 text-[11px] text-blue-100">
                    Active workload
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5">
                <AlertCircle size={17} className="text-red-200" />
                <div>
                  <p className="text-lg font-bold leading-5">
                    {isLoading ? "—" : stats.urgent}
                  </p>
                  <p className="mt-1 text-[11px] text-blue-100">
                    Urgent tickets
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/agent/my-tickets")}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 lg:self-center"
          >
            View my tickets
            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

      {/* Error message */}
      {isError && (
        <section
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <div className="rounded-xl bg-red-100 p-2 text-red-600">
            <AlertCircle size={20} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-red-800">
              Unable to load tickets
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error?.data?.message ||
                error?.error ||
                "Please check your login or backend API."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm font-bold text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        </section>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Ticket overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick snapshot of your current workload.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live workspace
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            title="Assigned tickets"
            value={stats.total}
            icon={Ticket}
            iconStyle="bg-blue-50 text-blue-600"
            description="Total tickets assigned to you"
            loading={isLoading}
          />

          <StatCard
            title="Open tickets"
            value={stats.open}
            icon={Clock3}
            iconStyle="bg-amber-50 text-amber-600"
            description="Waiting for your action"
            loading={isLoading}
          />

          <StatCard
            title="In progress"
            value={stats.progress}
            icon={TrendingUp}
            iconStyle="bg-violet-50 text-violet-600"
            description="Currently being handled"
            loading={isLoading}
          />

          <StatCard
            title="Resolved tickets"
            value={stats.resolved}
            icon={CheckCircle2}
            iconStyle="bg-emerald-50 text-emerald-600"
            description="Successfully resolved"
            loading={isLoading}
          />
        </div>
      </section>

      {/* Urgent alert */}
      {!isLoading && !isError && stats.urgent > 0 && (
        <section className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={23} />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-slate-900">
              Urgent attention required
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              You have {stats.urgent} urgent{" "}
              {stats.urgent === 1 ? "ticket" : "tickets"} to review.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPriorityFilter("urgent")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Review urgent
            <ArrowUpRight size={16} />
          </button>
        </section>
      )}

      {/* Tickets panel */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  My assigned tickets
                </h2>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {filteredTickets.length}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-500">
                Find, filter, and open your assigned customer requests.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
              <div className="relative xl:w-64">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tickets..."
                  aria-label="Search tickets"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </FilterSelect>

              <FilterSelect
                value={priorityFilter}
                onChange={setPriorityFilter}
                label="Filter by priority"
              >
                <option value="all">All priorities</option>
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
                <option value="urgent">Urgent priority</option>
              </FilterSelect>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RotateCcw size={15} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <span className="text-xs text-slate-500">Active filters</span>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Search: {search}
                  <X size={12} />
                </button>
              )}

              {statusFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700"
                >
                  {statusFilter}
                  <X size={12} />
                </button>
              )}

              {priorityFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setPriorityFilter("all")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold capitalize text-orange-700"
                >
                  {priorityFilter} priority
                  <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="px-5 py-14 text-center">
            <AlertCircle size={30} className="mx-auto text-red-400" />
            <h3 className="mt-3 font-bold text-slate-800">
              Tickets could not be displayed
            </h3>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Retry loading
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={28} />
            </div>
            <h3 className="mt-4 font-bold text-slate-800">
              No tickets found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {tickets.length === 0
                ? "No tickets have been assigned to you yet. New assignments will appear here."
                : "No tickets match your search or selected filters."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={15} />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-4 sm:px-6">Ticket</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created date</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => {
                  const ticketId = ticket._id;
                  const status = getStatus(ticket);
                  const priority = getPriority(ticket);
                  const customer = getCustomer(ticket);

                  return (
                    <tr
                      key={ticketId || getTicketNumber(ticket)}
                      className="group transition-colors hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                            <Ticket size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800">
                              {getTicketNumber(ticket)}
                            </p>
                            <p className="mt-1 max-w-[250px] truncate text-sm text-slate-500">
                              {ticket.subject ||
                                ticket.Subject ||
                                "Untitled ticket"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex max-w-[220px] items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold uppercase text-blue-700">
                            {customer.charAt(0)}
                          </div>
                          <span className="truncate text-sm text-slate-600">
                            {customer}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge value={priority} styles={priorityStyles} />
                      </td>

                      <td className="px-5 py-4">
                        <Badge value={status} styles={statusStyles} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays size={14} className="text-slate-400" />
                          {formatDate(ticket.createdAt || ticket.CreatedAt)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openTicket(ticket)}
                          disabled={!ticketId}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Open ticket
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Showing{" "}
            <strong className="text-slate-800">
              {filteredTickets.length}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-800">{tickets.length}</strong>{" "}
            tickets
          </span>

          {isFetching && !isLoading && (
            <span className="inline-flex items-center gap-2 text-blue-600">
              <RefreshCw size={13} className="animate-spin" />
              Updating tickets...
            </span>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 pb-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>BitMax Support Workspace</p>
        <p className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} />
          Agent portal
        </p>
      </footer>
    </div>
  );
}
