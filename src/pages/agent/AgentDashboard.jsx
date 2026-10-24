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

const statusRails = {
  open: "bg-blue-400",
  "in progress": "bg-amber-400",
  resolved: "bg-emerald-400",
  closed: "bg-slate-300",
};

const priorityStyles = {
  low: "bg-slate-100 text-slate-600 ring-slate-200",
  medium: "bg-sky-50 text-sky-700 ring-sky-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  urgent: "bg-red-50 text-red-700 ring-red-200",
};

/* display-only: tabs shown above the list */
const statusTabs = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const goldButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 text-sm font-bold text-neutral-950 shadow-[0_10px_30px_rgba(217,160,40,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60";

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

function OverviewStat({
  title,
  value,
  icon: Icon,
  description,
  loading,
  className = "",
}) {
  return (
    <article className={`p-5 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={16} className="text-amber-600" strokeWidth={2} />
        {title}
      </div>

      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
        {loading ? "—" : value}
      </p>

      <p className="mt-1.5 text-xs text-slate-400">{description}</p>
    </article>
  );
}

function FilterSelect({ value, onChange, label, children }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="min-w-0 rounded-xl border border-amber-200/70 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none transition hover:border-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-300/20"
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

  /* ---------- display-only helpers ---------- */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeWorkload = stats.open + stats.progress;

  const barTotal =
    stats.open + stats.progress + stats.resolved + stats.closed;

  const barParts = [
    { label: "Open", value: stats.open, color: "bg-blue-400" },
    { label: "In progress", value: stats.progress, color: "bg-amber-400" },
    { label: "Resolved", value: stats.resolved, color: "bg-emerald-400" },
    { label: "Closed", value: stats.closed, color: "bg-slate-400" },
  ];

  const tabCount = (value) =>
    value === "all"
      ? tickets.length
      : tickets.filter((ticket) => getStatus(ticket) === value).length;

  return (
    <div className="min-h-full space-y-7 p-4 sm:p-6 lg:p-8">
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden rounded-[28px] border border-amber-200/15 bg-[#0a0907] text-white shadow-[0_25px_60px_rgba(20,15,5,0.35),inset_0_1px_0_rgba(253,234,168,0.12)]">
        <div className="pointer-events-none absolute -left-24 -top-28 -z-10 h-80 w-80 rounded-full bg-amber-600/25 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 right-10 -z-10 h-72 w-72 rounded-full bg-yellow-500/15 blur-[110px]" />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f5d78a 1px, transparent 1px), linear-gradient(to bottom, #f5d78a 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at 75% 50%, black 15%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 75% 50%, black 15%, transparent 70%)",
          }}
        />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:p-10">
          <div>
            <p className="inline-flex items-center gap-2 text-sm text-amber-100/70">
              <Headset size={15} className="text-amber-300" />
              Agent workspace ·{" "}
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {greeting},
              <br />
              <span className="text-amber-100">Agent.</span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/55 sm:text-base">
              {isLoading
                ? "Loading your queue..."
                : activeWorkload > 0
                  ? `You have ${activeWorkload} active ${activeWorkload === 1 ? "ticket" : "tickets"} waiting on you${stats.urgent > 0 ? `, ${stats.urgent} marked urgent` : ""}.`
                  : "Your queue is clear. New assignments will show up here."}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/agent/my-tickets")}
                className={`${goldButton} px-5 py-3.5`}
              >
                Go to my tickets
                <ArrowUpRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Workload breakdown */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[inset_0_1px_0_rgba(253,234,168,0.1)] backdrop-blur-xl">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-white/55">Your workload</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight">
                  {isLoading ? "—" : stats.total}
                  <span className="ml-2 text-sm font-normal text-white/45">
                    assigned
                  </span>
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            {/* Segmented bar */}
            <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-white/10">
              {!isLoading &&
                barTotal > 0 &&
                barParts.map((part) =>
                  part.value > 0 ? (
                    <div
                      key={part.label}
                      className={part.color}
                      style={{ width: `${(part.value / barTotal) * 100}%` }}
                      title={`${part.label}: ${part.value}`}
                    />
                  ) : null
                )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {barParts.map((part) => (
                <div key={part.label} className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${part.color}`} />
                  <span className="text-white/60">{part.label}</span>
                  <span className="ml-auto font-semibold">
                    {isLoading ? "—" : part.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- API error ---------- */}
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
              We couldn't load your tickets
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
              Retry
            </button>
          </div>
        </section>
      )}

      {/* ---------- Overview band ---------- */}
      <section className="overflow-hidden rounded-2xl border border-amber-200/50 bg-white shadow-[0_8px_30px_rgba(120,85,10,0.06)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-amber-100">
          <OverviewStat
            title="Assigned to you"
            value={stats.total}
            icon={Ticket}
            description="All tickets in your queue"
            loading={isLoading}
            className="border-b border-r border-amber-100 lg:border-b-0 lg:border-r-0"
          />

          <OverviewStat
            title="Waiting on you"
            value={stats.open}
            icon={Clock3}
            description="Open and untouched"
            loading={isLoading}
            className="border-b border-amber-100 lg:border-b-0"
          />

          <OverviewStat
            title="Being handled"
            value={stats.progress}
            icon={TrendingUp}
            description="Currently in progress"
            loading={isLoading}
            className="border-r border-amber-100 lg:border-r-0"
          />

          <OverviewStat
            title="Wrapped up"
            value={stats.resolved}
            icon={CheckCircle2}
            description="Resolved so far"
            loading={isLoading}
          />
        </div>
      </section>

      {/* ---------- Urgent alert ---------- */}
      {!isLoading && !isError && stats.urgent > 0 && (
        <section className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-red-200 bg-white p-5 pl-7 shadow-sm sm:flex-row sm:items-center">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-red-500" />

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={23} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">
              Needs your attention
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {stats.urgent} urgent{" "}
              {stats.urgent === 1 ? "ticket is" : "tickets are"} waiting for
              a reply.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPriorityFilter("urgent")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Show urgent
            <ArrowUpRight size={16} />
          </button>
        </section>
      )}

      {/* ---------- Tickets ---------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Your queue
              </h2>
              <span className="rounded-lg border border-amber-200/70 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                {filteredTickets.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Search, filter and open the tickets assigned to you.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl border border-amber-200/50 bg-white p-4 shadow-[0_6px_24px_rgba(120,85,10,0.05)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ticket, subject or customer"
                aria-label="Search tickets"
                className="w-full rounded-xl border border-amber-200/70 bg-white py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-300/20"
              />
            </div>

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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-amber-50"
              >
                <RotateCcw size={15} />
                Clear
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div
            role="tablist"
            aria-label="Filter by status"
            className="mt-4 flex gap-2 overflow-x-auto pb-1"
          >
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-amber-300 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900"
                      : "border-transparent text-slate-500 hover:bg-amber-50 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      active
                        ? "bg-amber-300/50 text-amber-900"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tabCount(tab.value)}
                  </span>
                </button>
              );
            })}
          </div>

          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-amber-100 pt-3">
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold capitalize text-amber-800"
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

        {/* List */}
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl bg-amber-100/50"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-200 bg-white px-5 py-14 text-center">
              <AlertCircle size={30} className="mx-auto text-red-400" />
              <h3 className="mt-3 font-semibold text-slate-800">
                We couldn't display your tickets
              </h3>
              <button
                type="button"
                onClick={() => refetch()}
                className={`${goldButton} mt-4 px-5 py-2.5`}
              >
                Retry
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300/60 bg-white/60 px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700">
                <Inbox size={28} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">
                Nothing to show
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {tickets.length === 0
                  ? "No tickets are assigned to you yet. New assignments will appear here."
                  : "No tickets match your search or filters."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-amber-50"
                >
                  <RotateCcw size={15} />
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredTickets.map((ticket) => {
                const ticketId = ticket._id;
                const status = getStatus(ticket);
                const priority = getPriority(ticket);
                const customer = getCustomer(ticket);

                return (
                  <li
                    key={ticketId || getTicketNumber(ticket)}
                    className="group relative grid gap-4 overflow-hidden rounded-2xl border border-amber-200/50 bg-white py-4 pl-6 pr-4 shadow-[0_6px_24px_rgba(120,85,10,0.04)] transition hover:border-amber-300 hover:shadow-[0_14px_36px_rgba(120,85,10,0.1)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] lg:items-center lg:pr-5"
                  >
                    <span
                      className={`absolute inset-y-0 left-0 w-1.5 ${
                        statusRails[status] || "bg-slate-300"
                      }`}
                    />

                    {/* Ticket */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                          {getTicketNumber(ticket)}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <CalendarDays size={13} />
                          {formatDate(ticket.createdAt || ticket.CreatedAt)}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-base font-semibold text-slate-800">
                        {ticket.subject || ticket.Subject || "Untitled ticket"}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/70 bg-gradient-to-br from-amber-50 to-amber-100 text-xs font-bold uppercase text-amber-800">
                        {customer.charAt(0)}
                      </div>
                      <span className="truncate text-sm text-slate-600">
                        {customer}
                      </span>
                    </div>

                    {/* Badges + action */}
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Badge value={priority} styles={priorityStyles} />
                      <Badge value={status} styles={statusStyles} />

                      <button
                        type="button"
                        onClick={() => openTicket(ticket)}
                        disabled={!ticketId}
                        className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-200 hover:to-amber-400 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Open
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 px-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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
            <span className="inline-flex items-center gap-2 text-amber-700">
              <RefreshCw size={13} className="animate-spin" />
              Updating...
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