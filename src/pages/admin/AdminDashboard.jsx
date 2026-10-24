import { Link } from "react-router-dom";
import {
  Ticket,
  Users,
  Headset,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  Inbox,
  Activity,
  CircleAlert,
} from "lucide-react";
import { useGetAdminDashboardQuery } from "../../services/RTK/adminApi";


const getValue = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }

  return undefined;
};

const getArray = (...values) => {
  return values.find(Array.isArray) ?? [];
};

const getTicketStatus = (ticket) =>
  String(getValue(ticket, "Status", "status") || "open")
    .toLowerCase()
    .replaceAll("_", " ")
    .trim();

const getTicketPriority = (ticket) =>
  String(getValue(ticket, "Priority", "priority") || "medium")
    .toLowerCase()
    .trim();

const getAssignedAgent = (ticket) =>
  getValue(ticket, "AssignedTo", "assignedTo", "assignedAgent");

const getTicketNumber = (ticket) =>
  getValue(ticket, "TicketNumber", "ticketNumber") ||
  ticket?._id?.slice(-6) ||
  "—";

const getTicketSubject = (ticket) =>
  getValue(ticket, "Subject", "subject") || "Untitled ticket";

const getTicketDate = (ticket) =>
  getValue(ticket, "createdAt", "CreatedAt", "updatedAt", "UpdatedAt");

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusStyles = {
  open: "bg-sky-50 text-sky-700 ring-sky-200",
  reopened: "bg-orange-50 text-orange-700 ring-orange-200",
  pending: "bg-rose-50 text-rose-600 ring-rose-200",
  "in progress": "bg-amber-50 text-amber-700 ring-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

const priorityStyles = {
  low: "bg-neutral-100 text-neutral-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
};

const greenButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] text-sm font-semibold text-white shadow-md shadow-[#0d3b27]/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 disabled:cursor-not-allowed disabled:opacity-60";

function StatCard({
  label,
  value,
  icon: Icon,
  link,
  loading,
  featured = false,
}) {
  return (
    <Link
      to={link}
      className={`group relative overflow-hidden rounded-3xl p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0d3b27]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 sm:p-6 ${
        featured
          ? "bg-gradient-to-br from-[#1b7048] via-[#115236] to-[#0a2e1e] text-white"
          : "bg-white text-[#0f3d28]"
      }`}
    >
      {featured && (
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-white/10" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon
            size={18}
            className={featured ? "text-[#9ee6bd]" : "text-[#1f7a4d]"}
          />
          <p className="text-base font-medium">{label}</p>
        </div>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition group-hover:rotate-45 ${
            featured
              ? "bg-white text-[#0f3d28]"
              : "border border-[#0f3d28]/40 text-[#0f3d28]"
          }`}
        >
          <ArrowUpRight size={16} />
        </span>
      </div>

      <p className="mt-4 text-5xl font-semibold tracking-tight">
        {loading ? (
          <span
            className={`inline-block h-11 w-20 animate-pulse rounded-xl ${
              featured ? "bg-white/15" : "bg-neutral-100"
            }`}
          />
        ) : (
          Number(value ?? 0).toLocaleString("en-IN")
        )}
      </p>

      <p
        className={`mt-3 text-xs ${
          featured ? "text-[#9ee6bd]" : "text-[#1f7a4d]"
        }`}
      >
        View details
      </p>
    </Link>
  );
}

function AttentionCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  link,
  loading,
}) {
  return (
    <Link
      to={link}
      className="group flex items-center gap-4 rounded-3xl bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0d3b27]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 sm:p-6"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color.icon}`}
      >
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-500">{title}</p>

        <p className="mt-1 text-3xl font-semibold tracking-tight text-[#0f3d28]">
          {loading ? "—" : Number(value ?? 0).toLocaleString("en-IN")}
        </p>

        <p className={`mt-1 text-xs ${color.subtitle}`}>{subtitle}</p>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-neutral-300 transition group-hover:translate-x-1 group-hover:text-[#1f7a4d]"
      />
    </Link>
  );
}

function ResolutionGauge({ percent, resolvedCount, link, loading }) {
  const safePercent = Math.min(
    100,
    Math.max(0, Math.round(Number(percent) || 0))
  );
  const gaugeLength = Math.PI * 80;

  return (
    <Link
      to={link}
      className="group flex flex-col rounded-3xl bg-white p-5 transition hover:shadow-lg hover:shadow-[#0d3b27]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium text-[#0f3d28]">
          Resolution rate
        </h3>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0f3d28]/40 text-[#0f3d28] transition group-hover:rotate-45">
          <ArrowUpRight size={16} />
        </span>
      </div>

      <div className="relative mx-auto mt-3 w-full max-w-[250px]">
        <svg viewBox="0 0 200 110" className="w-full">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e4e8e5"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1f7a4d"
            strokeWidth="22"
            strokeLinecap="round"
            strokeDasharray={`${
              loading ? 0 : (safePercent / 100) * gaugeLength
            } ${gaugeLength}`}
          />
        </svg>

        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="text-4xl font-semibold tracking-tight text-[#0f3d28]">
            {loading ? "—" : `${safePercent}%`}
          </p>
          <p className="text-xs text-[#1f7a4d]">Resolved</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-neutral-500">
        {resolvedCount} ticket(s) resolved or closed
      </p>
    </Link>
  );
}

function ErrorState({ message, onRetry, retrying }) {
  return (
    <div
      role="alert"
      className="rounded-3xl border border-red-200 bg-red-50 p-5"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white p-2 text-red-600">
          <CircleAlert size={21} />
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-red-900">
            Dashboard data could not be loaded
          </h2>

          <p className="mt-1 text-sm leading-6 text-red-700">
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={retrying ? "animate-spin" : ""}
            />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAdminDashboardQuery();

  /*
   * Expected backend response example:
   * {
   *   success: true,
   *   stats: { totalTickets, totalUsers, supportAgents, ... },
   *   totalTicket: [],
   *   recentTickets: []
   * }
   *
   * Also supports { data: { ...dashboard fields } }.
   */
  const dashboard = response?.data ?? response ?? {};

  const tickets = getArray(
    dashboard.totalTicket,
    dashboard.tickets,
    dashboard.allTickets,
    dashboard.data?.totalTicket,
    dashboard.data?.tickets
  );

  const recentTicketsFromApi = getArray(
    dashboard.recentTickets,
    dashboard.recentTicket,
    dashboard.data?.recentTickets
  );

  const statsFromApi = dashboard.stats ?? dashboard.statistics ?? {};

  const sortedTickets = [...tickets].sort((a, b) => {
    const dateA = new Date(
      getValue(a, "updatedAt", "UpdatedAt", "createdAt", "CreatedAt") || 0
    ).getTime();

    const dateB = new Date(
      getValue(b, "updatedAt", "UpdatedAt", "createdAt", "CreatedAt") || 0
    ).getTime();

    return dateB - dateA;
  });

  const resolvedTickets = tickets.filter((ticket) =>
    ["resolved", "closed"].includes(getTicketStatus(ticket))
  );

  const openTickets = tickets.filter((ticket) =>
    ["open", "reopened"].includes(getTicketStatus(ticket))
  );

  const pendingTickets = tickets.filter((ticket) =>
    ["pending", "in progress"].includes(getTicketStatus(ticket))
  );

  const unassignedTickets = tickets.filter((ticket) => {
    const assigned = getAssignedAgent(ticket);

    return (
      !assigned ||
      assigned === null ||
      (typeof assigned === "string" && !assigned.trim())
    );
  });

  const urgentTickets = tickets.filter((ticket) =>
    ["high", "urgent"].includes(getTicketPriority(ticket))
  );

  const totalTickets =
    statsFromApi.totalTickets ??
    dashboard.totalCount ??
    tickets.length;

  const totalUsers =
    statsFromApi.totalUsers ??
    dashboard.totalUsers ??
    getArray(dashboard.users, dashboard.data?.users).length;

  const totalAgents =
    statsFromApi.supportAgents ??
    statsFromApi.totalAgents ??
    dashboard.totalAgents ??
    getArray(dashboard.agents, dashboard.data?.agents).length;

  const resolvedCount =
    statsFromApi.resolvedTickets ?? resolvedTickets.length;

  const openCount = statsFromApi.openTickets ?? openTickets.length;

  const pendingCount =
    statsFromApi.pendingInProgress ?? pendingTickets.length;

  const unassignedCount =
    statsFromApi.unassignedTickets ??
    dashboard.unassignedCount ??
    unassignedTickets.length;

  const urgentCount =
    statsFromApi.highUrgentPriority ?? urgentTickets.length;

  const resolutionRate =
    statsFromApi.resolutionRate ??
    (Number(totalTickets) > 0
      ? Math.round((Number(resolvedCount) / Number(totalTickets)) * 100)
      : 0);

  const recentTickets =
    recentTicketsFromApi.length > 0
      ? recentTicketsFromApi.slice(0, 6)
      : sortedTickets.slice(0, 6);

  const stats = [
    {
      label: "Total Tickets",
      value: totalTickets,
      icon: Ticket,
      link: "/admin/tickets",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      link: "/admin/users",
    },
    {
      label: "Support Agents",
      value: totalAgents,
      icon: Headset,
      link: "/admin/agents",
    },
    {
      label: "Resolved Tickets",
      value: resolvedCount,
      icon: CheckCircle2,
      link: "/admin/tickets",
    },
    {
      label: "Open Tickets",
      value: openCount,
      icon: Inbox,
      link: "/admin/tickets",
    },
    {
      label: "Pending / In Progress",
      value: pendingCount,
      icon: Clock,
      link: "/admin/tickets",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage customer accounts.",
      path: "/admin/users",
      icon: Users,
      iconColor: "bg-[#1f7a4d]/10 text-[#1f7a4d]",
    },
    {
      title: "Manage Agents",
      description: "View your support team.",
      path: "/admin/agents",
      icon: Headset,
      iconColor: "bg-[#1f7a4d]/10 text-[#1f7a4d]",
    },
    {
      title: "Assign Tickets",
      description: "Review tickets awaiting assignment.",
      path: "/admin/unassigned",
      icon: Inbox,
      iconColor: "bg-[#1f7a4d]/10 text-[#1f7a4d]",
    },
    {
      title: "Categories",
      description: "Manage ticket categories.",
      path: "/admin/categories",
      icon: Activity,
      iconColor: "bg-[#1f7a4d]/10 text-[#1f7a4d]",
    },
  ];

  return (
    <main className="min-h-full">
      <div className="space-y-6">
        {/* Page heading */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#0f3d28] sm:text-5xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
              Monitor tickets, manage customers and support agents, and keep
              track of your support operations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={`${greenButton} shrink-0 px-6 py-3.5`}
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            {isFetching ? "Refreshing..." : "Refresh Data"}
          </button>
        </header>

        {/* Error state */}
        {isError && (
          <ErrorState
            message={
              error?.data?.message ||
              error?.error ||
              error?.message ||
              "Please check the dashboard API route, server and login session."
            }
            onRetry={() => refetch()}
            retrying={isFetching}
          />
        )}

        {/* Statistics */}
        <section aria-label="Dashboard statistics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                {...stat}
                featured={index === 0}
                loading={isLoading}
              />
            ))}
          </div>

          {!isLoading && !isError && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1f7a4d]">
              <span className="h-2 w-2 rounded-full bg-[#63c192]" />
              Dashboard connected
            </p>
          )}
        </section>

        {/* Attention / operational metrics */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#0f3d28]">
              Needs attention
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Items that may need your action
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
              <AttentionCard
                title="Unassigned Tickets"
                value={unassignedCount}
                subtitle="Waiting for an agent"
                icon={Inbox}
                link="/admin/unassigned"
                loading={isLoading}
                color={{
                  icon: "bg-amber-50 text-amber-600",
                  subtitle: "text-amber-700",
                }}
              />

              <AttentionCard
                title="High / Urgent Priority"
                value={urgentCount}
                subtitle="Review these tickets first"
                icon={AlertTriangle}
                link="/admin/tickets"
                loading={isLoading}
                color={{
                  icon: "bg-red-50 text-red-600",
                  subtitle: "text-red-600",
                }}
              />
            </div>

            <ResolutionGauge
              percent={resolutionRate}
              resolvedCount={resolvedCount}
              link="/admin/reports"
              loading={isLoading}
            />
          </div>
        </section>

        {/* Recent tickets */}
        <section className="overflow-hidden rounded-3xl bg-white">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f7a4d]/10 text-[#1f7a4d]">
                  <Ticket size={18} />
                </div>
                <h2 className="text-xl font-semibold text-[#0f3d28]">
                  Recent Tickets
                </h2>
              </div>

              <p className="mt-2 text-sm text-neutral-500">
                Latest tickets created or updated in the system.
              </p>
            </div>

            <Link
              to="/admin/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1f7a4d]/60 px-5 py-2.5 text-sm font-semibold text-[#0f3d28] transition hover:bg-[#1f7a4d]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50"
            >
              View All Tickets <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-6 pt-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-2xl bg-neutral-100"
                />
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1f7a4d]/10 text-[#1f7a4d]">
                <Ticket size={27} />
              </div>

              <h3 className="mt-4 font-semibold text-neutral-800">
                No tickets available
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Customer tickets will appear here when they are created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto px-3 pb-3 sm:px-4 sm:pb-4">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#f7f7f5] text-xs text-neutral-500">
                  <tr>
                    <th className="rounded-l-2xl px-5 py-3.5 font-medium">
                      Ticket ID
                    </th>
                    <th className="px-5 py-3.5 font-medium">Subject</th>
                    <th className="px-5 py-3.5 font-medium">Priority</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium">Assigned To</th>
                    <th className="px-5 py-3.5 font-medium">Created</th>
                    <th className="rounded-r-2xl px-5 py-3.5 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {recentTickets.map((ticket, index) => {
                    const status = getTicketStatus(ticket);
                    const priority = getTicketPriority(ticket);
                    const assigned = getAssignedAgent(ticket);

                    const agentName =
                      typeof assigned === "object"
                        ? getValue(assigned, "Name", "name", "Email", "email")
                        : assigned;

                    return (
                      <tr
                        key={ticket._id || getTicketNumber(ticket) || index}
                        className="transition hover:bg-[#f7f7f5]"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-full bg-[#1f7a4d]/10 px-2.5 py-1 text-xs font-bold text-[#1f7a4d]">
                            {getTicketNumber(ticket)}
                          </span>
                        </td>

                        <td className="max-w-[240px] px-5 py-4">
                          <p className="truncate font-medium text-[#0f3d28]">
                            {getTicketSubject(ticket)}
                          </p>
                          <p className="mt-1 text-xs text-neutral-400">
                            Customer support
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              priorityStyles[priority] ||
                              "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {priority}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                              statusStyles[status] ||
                              "bg-neutral-100 text-neutral-500 ring-neutral-200"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-neutral-600">
                          {agentName || "Unassigned"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-neutral-500">
                          {formatDate(getTicketDate(ticket))}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <Link
                            to={`/admin/tickets/${ticket._id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-[#1f7a4d]/50 px-4 py-2 text-xs font-semibold text-[#0f3d28] transition hover:bg-[#0f3d28] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50"
                          >
                            View <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {isFetching && !isLoading && (
            <div className="bg-[#1f7a4d]/10 px-5 py-2 text-xs font-medium text-[#1f7a4d]">
              Updating dashboard data...
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#0f3d28]">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Jump directly to common admin tasks.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group rounded-3xl bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0d3b27]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${action.iconColor}`}
                    >
                      <Icon size={21} />
                    </div>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0f3d28]/30 text-[#0f3d28] transition group-hover:rotate-45 group-hover:bg-[#0f3d28] group-hover:text-white">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>

                  <h3 className="mt-4 font-semibold text-[#0f3d28]">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 pt-2 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Admin Dashboard · Support Management System</p>

          <p>
            {isFetching
              ? "Syncing data..."
              : "Data is shown from your dashboard API"}
          </p>
        </footer>
      </div>
    </main>
  );
}