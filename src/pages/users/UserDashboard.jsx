
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Ticket,
  FolderOpen,
  CheckCircle2,
  Clock3,
  Plus,
  MessageCircle,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Headset,
  Sparkles,
  CalendarDays,
} from "lucide-react";

import { useGetMyTicketsQuery } from "../../services/RTK/ticketApi";
import { selectCurrentUser } from "../../services/authSlice";

const normalizeStatus = (status = "") =>
  String(status).toLowerCase().replaceAll("_", " ").trim();

const UserDashboard = () => {
  const user = useSelector(selectCurrentUser);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMyTicketsQuery();

  const userName =
    user?.name ||
    user?.Name ||
    user?.fullName ||
    "there";

  const tickets = Array.isArray(data)
    ? data
    : data?.tickets ??
      data?.data?.tickets ??
      (Array.isArray(data?.data) ? data.data : []);

  const openStatuses = ["open", "pending", "in progress"];
  const resolvedStatuses = ["resolved", "closed"];

  const openTickets = tickets.filter((ticket) =>
    openStatuses.includes(
      normalizeStatus(ticket.status ?? ticket.Status)
    )
  ).length;

  const resolvedTickets = tickets.filter((ticket) =>
    resolvedStatuses.includes(
      normalizeStatus(ticket.status ?? ticket.Status)
    )
  ).length;

  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
        new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
    )
    .slice(0, 5);

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

  const getStatusStyle = (status = "") => {
    const styles = {
      open: "bg-blue-50 text-blue-700 ring-blue-200",
      pending: "bg-amber-50 text-amber-700 ring-amber-200",
      "in progress": "bg-violet-50 text-violet-700 ring-violet-200",
      resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      closed: "bg-slate-100 text-slate-600 ring-slate-200",
    };

    return (
      styles[normalizeStatus(status)] ||
      "bg-slate-100 text-slate-600 ring-slate-200"
    );
  };

  const getPriorityStyle = (priority = "") => {
    const styles = {
      urgent: "bg-red-50 text-red-700 ring-red-200",
      high: "bg-orange-50 text-orange-700 ring-orange-200",
      medium: "bg-amber-50 text-amber-700 ring-amber-200",
      normal: "bg-blue-50 text-blue-700 ring-blue-200",
      low: "bg-slate-100 text-slate-600 ring-slate-200",
    };

    return (
      styles[String(priority).toLowerCase().trim()] ||
      "bg-slate-100 text-slate-600 ring-slate-200"
    );
  };

  const getErrorMessage = () =>
    error?.data?.message ||
    error?.error ||
    error?.message ||
    "Unable to load your tickets. Please try again.";

  return (
    <div className="space-y-7 pb-8">
      {/* Welcome header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-500 p-6 text-white shadow-xl shadow-indigo-100 sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/[0.07]" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-white/[0.06]" />

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-50 backdrop-blur">
              <Sparkles size={14} />
              CUSTOMER SUPPORT CENTER
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {userName}!
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
              Here's an overview of your support requests.
              Track your tickets, follow replies, and get the help
              you need.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-indigo-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <Ticket size={15} />
                {tickets.length} total tickets
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <CalendarDays size={15} />
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <Link
            to="/user/create-ticket"
            className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            <Plus size={19} />
            Create New Ticket
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Initial loading */}
      {isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <LoaderCircle
              size={30}
              className="animate-spin text-indigo-600"
            />
          </div>

          <p className="mt-4 font-semibold text-slate-800">
            Loading your dashboard
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Fetching your latest support tickets...
          </p>
        </div>
      )}

      {/* API error */}
      {!isLoading && isError && (
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {getErrorMessage()}
          </p>

          <button
            type="button"
            onClick={refetch}
            disabled={isFetching}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Try Again
          </button>
        </div>
      )}

      {/* Dashboard content */}
      {!isLoading && !isError && (
        <>
          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Tickets"
              value={tickets.length}
              icon={Ticket}
              color="blue"
            />

            <SummaryCard
              title="Open Tickets"
              value={openTickets}
              icon={FolderOpen}
              color="amber"
            />

            <SummaryCard
              title="Resolved Tickets"
              value={resolvedTickets}
              icon={CheckCircle2}
              color="green"
            />

            <SummaryCard
              title="Recent Tickets"
              value={recentTickets.length}
              icon={Clock3}
              color="violet"
              description="Latest 5 tickets"
            />
          </section>

          {/* Quick actions */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Everything you need to manage your support requests.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <QuickAction
                to="/user/create-ticket"
                title="Need Help?"
                description="Create a support ticket and tell us about your issue."
                icon={Plus}
                color="blue"
              />

              <QuickAction
                to="/user/my-tickets"
                title="My Conversations"
                description="Review ticket history, replies, and support updates."
                icon={MessageCircle}
                color="violet"
              />
            </div>
          </section>

          {/* Recent tickets */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Recent Tickets
                  </h2>

                  {isFetching && (
                    <LoaderCircle
                      size={16}
                      className="animate-spin text-indigo-500"
                    />
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Check the status of your latest support requests.
                </p>
              </div>

              <Link
                to="/user/my-tickets"
                className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:self-auto"
              >
                View All Tickets
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentTickets.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Ticket size={30} />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  No tickets yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  You haven't created any support tickets. Create
                  your first ticket and our team will help you.
                </p>

                <Link
                  to="/user/create-ticket"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Create Your First Ticket
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">Ticket ID</th>
                      <th className="px-5 py-4 font-bold">Subject</th>
                      <th className="px-5 py-4 font-bold">Priority</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                      <th className="px-5 py-4 font-bold">Created</th>
                      <th className="px-5 py-4 font-bold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentTickets.map((ticket) => {
                      const id = ticket._id ?? ticket.id;

                      const status =
                        ticket.status ?? ticket.Status ?? "open";

                      const priority =
                        ticket.priority ?? ticket.Priority ?? "normal";

                      const subject =
                        ticket.subject ??
                        ticket.Subject ??
                        "Untitled ticket";

                      const ticketNumber =
                        ticket.ticketNumber ??
                        ticket.TicketNumber ??
                        (id
                          ? `TKT-${String(id).slice(-6).toUpperCase()}`
                          : "—");

                      return (
                        <tr
                          key={id ?? ticketNumber}
                          className="transition hover:bg-slate-50/80"
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700">
                              {ticketNumber}
                            </span>
                          </td>

                          <td className="max-w-64 px-5 py-4">
                            <p className="truncate font-semibold text-slate-800">
                              {subject}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Support request
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getPriorityStyle(priority)}`}
                            >
                              {String(priority).toLowerCase()}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusStyle(status)}`}
                            >
                              {normalizeStatus(status)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                            {formatDate(
                              ticket.createdAt ?? ticket.CreatedAt
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            {id ? (
                              <Link
                                to={`/user/tickets/${id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800"
                              >
                                View Details
                                <ArrowRight size={15} />
                              </Link>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {recentTickets.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
                <p className="text-xs text-slate-500">
                  Showing {recentTickets.length} of {tickets.length} tickets
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  color,
  description = "Based on your tickets",
}) => {
  const colors = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      accent: "bg-blue-500",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      accent: "bg-amber-500",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      accent: "bg-emerald-500",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      accent: "bg-violet-500",
    },
  };

  const style = colors[color] || colors.blue;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${style.accent}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.icon}`}
        >
          <Icon size={23} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({
  to,
  title,
  description,
  icon: Icon,
  color,
}) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
  };

  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-6"
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${colors[color] || colors.blue}`}
        >
          <Icon size={23} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-800">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <ArrowRight
          size={19}
          className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
        />
      </div>
    </Link>
  );
};

export default UserDashboard;
