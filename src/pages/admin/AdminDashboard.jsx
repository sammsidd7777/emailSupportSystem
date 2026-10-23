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
  Inbox,
  TrendingUp,
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
  open: "bg-blue-50 text-blue-700 ring-blue-100",
  reopened: "bg-orange-50 text-orange-700 ring-orange-100",
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  "in progress": "bg-violet-50 text-violet-700 ring-violet-100",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

const priorityStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
};

function StatCard({ label, value, icon: Icon, color, link, loading }) {
  return (
    <Link
      to={link}
      className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? (
              <span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              Number(value ?? 0).toLocaleString("en-IN")
            )}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-400">
          View details
        </span>
        <ArrowRight
          size={15}
          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
        />
      </div>
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
      className={`group flex items-center gap-4 rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${color.border} ${color.bg}`}
    >
      <div className={`rounded-xl bg-white p-3 shadow-sm ${color.icon}`}>
        <Icon size={23} />
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${color.title}`}>{title}</p>

        <p className={`mt-1 text-2xl font-bold ${color.number}`}>
          {loading ? "—" : Number(value ?? 0).toLocaleString("en-IN")}
        </p>

        <p className={`mt-1 text-xs ${color.subtitle}`}>{subtitle}</p>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-slate-400 transition group-hover:translate-x-1"
      />
    </Link>
  );
}

function ErrorState({ message, onRetry, retrying }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-5"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 text-red-600">
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
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
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
      color: "bg-blue-50 text-blue-600",
      link: "/admin/tickets",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-violet-50 text-violet-600",
      link: "/admin/users",
    },
    {
      label: "Support Agents",
      value: totalAgents,
      icon: Headset,
      color: "bg-indigo-50 text-indigo-600",
      link: "/admin/agents",
    },
    {
      label: "Resolved Tickets",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
      link: "/admin/tickets",
    },
    {
      label: "Open Tickets",
      value: openCount,
      icon: Inbox,
      color: "bg-amber-50 text-amber-600",
      link: "/admin/tickets",
    },
    {
      label: "Pending / In Progress",
      value: pendingCount,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
      link: "/admin/tickets",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage customer accounts.",
      path: "/admin/users",
      icon: Users,
      iconColor: "bg-violet-50 text-violet-600",
    },
    {
      title: "Manage Agents",
      description: "View your support team.",
      path: "/admin/agents",
      icon: Headset,
      iconColor: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Assign Tickets",
      description: "Review tickets awaiting assignment.",
      path: "/admin/unassigned",
      icon: Inbox,
      iconColor: "bg-amber-50 text-amber-600",
    },
    {
      title: "Categories",
      description: "Manage ticket categories.",
      path: "/admin/categories",
      icon: Activity,
      iconColor: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/80 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page heading */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Administration
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor tickets, manage customers and support agents, and keep
              track of your support operations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Key support metrics at a glance
              </p>
            </div>

            {!isLoading && !isError && (
              <span className="hidden items-center gap-1.5 text-xs font-medium text-emerald-600 sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Dashboard connected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                {...stat}
                loading={isLoading}
              />
            ))}
          </div>
        </section>

        {/* Attention / operational metrics */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Needs Attention
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Items that may need your action
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AttentionCard
              title="Unassigned Tickets"
              value={unassignedCount}
              subtitle="Waiting for an agent"
              icon={Inbox}
              link="/admin/unassigned"
              loading={isLoading}
              color={{
                bg: "bg-amber-50/80",
                border: "border-amber-200",
                icon: "text-amber-600",
                title: "text-amber-900",
                number: "text-amber-950",
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
                bg: "bg-red-50/80",
                border: "border-red-200",
                icon: "text-red-600",
                title: "text-red-900",
                number: "text-red-950",
                subtitle: "text-red-700",
              }}
            />

            <AttentionCard
              title="Resolution Rate"
              value={`${Math.round(Number(resolutionRate) || 0)}%`}
              subtitle={`${resolvedCount} ticket(s) resolved or closed`}
              icon={TrendingUp}
              link="/admin/reports"
              loading={isLoading}
              color={{
                bg: "bg-blue-50/80",
                border: "border-blue-200",
                icon: "text-blue-600",
                title: "text-blue-900",
                number: "text-blue-950",
                subtitle: "text-blue-700",
              }}
            />
          </div>
        </section>

        {/* Recent tickets */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Ticket size={18} />
                </div>
                <h2 className="font-bold text-slate-900">Recent Tickets</h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Latest tickets created or updated in the system.
              </p>
            </div>

            <Link
              to="/admin/tickets"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
            >
              View All Tickets <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Ticket size={27} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No tickets available
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Customer tickets will appear here when they are created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Ticket ID</th>
                    <th className="px-5 py-4 font-semibold">Subject</th>
                    <th className="px-5 py-4 font-semibold">Priority</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Assigned To</th>
                    <th className="px-5 py-4 font-semibold">Created</th>
                    <th className="px-5 py-4 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
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
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-semibold text-blue-700">
                            {getTicketNumber(ticket)}
                          </span>
                        </td>

                        <td className="max-w-[240px] px-5 py-4">
                          <p className="truncate font-medium text-slate-800">
                            {getTicketSubject(ticket)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Customer support
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              priorityStyles[priority] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {priority}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                              statusStyles[status] ||
                              "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {agentName || "Unassigned"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                          {formatDate(getTicketDate(ticket))}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <Link
                            to={`/admin/tickets/${ticket._id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
            <div className="border-t border-blue-100 bg-blue-50/50 px-5 py-2 text-xs font-medium text-blue-700">
              Updating dashboard data...
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
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
                  className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`rounded-xl p-3 ${action.iconColor}`}>
                      <Icon size={21} />
                    </div>

                    <ArrowRight
                      size={17}
                      className="mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
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