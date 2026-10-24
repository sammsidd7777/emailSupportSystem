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

  /* ---------- display-only helpers ---------- */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const resolvedPercent = tickets.length
    ? Math.round((resolvedTickets / tickets.length) * 100)
    : 0;

  const RING_R = 52;
  const RING_C = 2 * Math.PI * RING_R;

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

  const getStatusRail = (status = "") => {
    const rails = {
      open: "bg-blue-400",
      pending: "bg-amber-400",
      "in progress": "bg-violet-400",
      resolved: "bg-emerald-400",
      closed: "bg-slate-300",
    };

    return rails[normalizeStatus(status)] || "bg-slate-300";
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
    <div className="space-y-8 pb-8">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-[28px] border border-amber-200/15 bg-[#0a0907] text-white shadow-[0_25px_60px_rgba(20,15,5,0.35),inset_0_1px_0_rgba(253,234,168,0.12)]">
        <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-amber-600/25 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-yellow-500/15 blur-[110px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
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

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:p-10">
          {/* Left: greeting */}
          <div>
            <p className="inline-flex items-center gap-2 text-sm text-amber-100/70">
              <CalendarDays size={15} className="text-amber-300" />
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {greeting},
              <br />
              <span className="text-amber-100">{userName}.</span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/55 sm:text-base">
              {tickets.length === 0
                ? "You have no requests yet. Tell us what you need and we'll take it from there."
                : openTickets > 0
                  ? `You have ${openTickets} active ${openTickets === 1 ? "request" : "requests"} with our team. Check in any time for replies.`
                  : "All your requests are resolved. Reach out whenever you need us again."}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/user/create-ticket"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 px-5 py-3.5 text-sm font-bold text-neutral-950 shadow-[0_10px_30px_rgba(217,160,40,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <Plus size={18} />
                Raise a request
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/user/my-tickets"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white"
              >
                See all requests
              </Link>
            </div>
          </div>

          {/* Right: resolution ring */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(253,234,168,0.1)]">
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 shrink-0">
                <svg
                  viewBox="0 0 120 120"
                  className="h-full w-full -rotate-90"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#fdeaa8" />
                      <stop offset="0.5" stopColor="#e5b84b" />
                      <stop offset="1" stopColor="#a8761a" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="60"
                    cy="60"
                    r={RING_R}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={RING_R}
                    fill="none"
                    stroke="url(#ring-g)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - resolvedPercent / 100)}
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold tracking-tight">
                    {resolvedPercent}%
                  </span>
                  <span className="text-[11px] text-white/45">resolved</span>
                </div>
              </div>

              <div className="min-w-0 space-y-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="text-white/60">Resolved</span>
                  <span className="ml-auto font-semibold">{resolvedTickets}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                  <span className="text-white/60">In progress</span>
                  <span className="ml-auto font-semibold">{openTickets}</span>
                </div>

                <div className="flex items-center gap-2.5 border-t border-white/10 pt-3">
                  <Ticket size={14} className="text-amber-300" />
                  <span className="text-white/60">All time</span>
                  <span className="ml-auto font-semibold">{tickets.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Loading ---------- */}
      {isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-amber-200/50 bg-white shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <LoaderCircle
              size={30}
              className="animate-spin text-amber-600"
            />
          </div>

          <p className="mt-4 font-semibold text-slate-800">
            Getting things ready
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Pulling in your latest requests...
          </p>
        </div>
      )}

      {/* ---------- Error ---------- */}
      {!isLoading && isError && (
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            We couldn't load your dashboard
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {getErrorMessage()}
          </p>

          <button
            type="button"
            onClick={refetch}
            disabled={isFetching}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 px-5 py-3 text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Retry
          </button>
        </div>
      )}

      {/* ---------- Content ---------- */}
      {!isLoading && !isError && (
        <>
          {/* Overview band */}
          <section className="overflow-hidden rounded-2xl border border-amber-200/50 bg-white shadow-[0_8px_30px_rgba(120,85,10,0.06)]">
            <div className="grid grid-cols-2 divide-amber-100 lg:grid-cols-4 lg:divide-x">
              <OverviewStat
                label="All requests"
                value={tickets.length}
                icon={Ticket}
                hint="Since you joined"
                className="border-b border-r border-amber-100 lg:border-b-0 lg:border-r-0"
              />
              <OverviewStat
                label="Waiting on us"
                value={openTickets}
                icon={FolderOpen}
                hint="Open or in progress"
                className="border-b border-amber-100 lg:border-b-0"
              />
              <OverviewStat
                label="Wrapped up"
                value={resolvedTickets}
                icon={CheckCircle2}
                hint="Resolved or closed"
                className="border-r border-amber-100 lg:border-r-0"
              />
              <OverviewStat
                label="Latest"
                value={recentTickets.length}
                icon={Clock3}
                hint="Shown below"
              />
            </div>
          </section>

          {/* Shortcuts */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              What would you like to do?
            </h2>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ShortcutTile
                to="/user/create-ticket"
                title="Start a new request"
                description="Describe the problem and our team will pick it up."
                icon={Plus}
                variant="dark"
              />

              <ShortcutTile
                to="/user/my-tickets"
                title="Pick up a conversation"
                description="Read replies and follow progress on past requests."
                icon={MessageCircle}
                variant="light"
              />
            </div>
          </section>

          {/* Latest activity */}
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Latest activity
                  </h2>

                  {isFetching && (
                    <LoaderCircle
                      size={16}
                      className="animate-spin text-amber-600"
                    />
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Your five most recently updated requests.
                </p>
              </div>

              <Link
                to="/user/my-tickets"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 transition hover:text-amber-900"
              >
                View everything
                <ArrowRight size={15} />
              </Link>
            </div>

            {recentTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-300/60 bg-white/60 px-5 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700">
                  <Headset size={30} />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Nothing here yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Your requests will show up here once you raise one.
                  It only takes a minute.
                </p>

                <Link
                  to="/user/create-ticket"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 px-5 py-3 text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/20 transition hover:brightness-110"
                >
                  <Plus size={17} />
                  Raise your first request
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
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
                    <li
                      key={id ?? ticketNumber}
                      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-amber-200/50 bg-white py-4 pl-6 pr-4 shadow-[0_6px_24px_rgba(120,85,10,0.04)] transition hover:border-amber-300 hover:shadow-[0_14px_36px_rgba(120,85,10,0.1)] sm:flex-row sm:items-center sm:pr-5"
                    >
                      {/* status rail */}
                      <span
                        className={`absolute inset-y-0 left-0 w-1.5 ${getStatusRail(status)}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                            {ticketNumber}
                          </span>

                          <span className="text-xs text-slate-400">
                            Opened {formatDate(ticket.createdAt ?? ticket.CreatedAt)}
                          </span>
                        </div>

                        <p className="mt-1.5 truncate text-base font-semibold text-slate-800">
                          {subject}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getPriorityStyle(priority)}`}
                        >
                          {String(priority).toLowerCase()}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusStyle(status)}`}
                        >
                          {normalizeStatus(status)}
                        </span>

                        {id ? (
                          <Link
                            to={`/user/tickets/${id}`}
                            className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100/70 hover:text-amber-900"
                          >
                            Open
                            <ArrowRight
                              size={15}
                              className="transition-transform group-hover:translate-x-0.5"
                            />
                          </Link>
                        ) : (
                          <span className="px-3 text-slate-400">—</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {recentTickets.length > 0 && (
              <p className="mt-4 text-center text-xs text-slate-400">
                Showing {recentTickets.length} of {tickets.length} requests
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const OverviewStat = ({
  label,
  value,
  icon: Icon,
  hint,
  className = "",
}) => (
  <div className={`p-5 sm:p-6 ${className}`}>
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Icon size={16} className="text-amber-600" strokeWidth={2} />
      {label}
    </div>

    <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
      {value}
    </p>

    <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
  </div>
);

const ShortcutTile = ({
  to,
  title,
  description,
  icon: Icon,
  variant,
}) => {
  const dark = variant === "dark";

  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl border p-6 transition duration-200 hover:-translate-y-0.5 ${
        dark
          ? "border-amber-200/20 bg-[#0a0907] text-white shadow-[0_18px_40px_rgba(20,15,5,0.25)] hover:shadow-[0_22px_50px_rgba(20,15,5,0.35)]"
          : "border-amber-200/60 bg-white text-slate-800 shadow-[0_6px_24px_rgba(120,85,10,0.05)] hover:border-amber-300 hover:shadow-[0_14px_36px_rgba(120,85,10,0.1)]"
      }`}
    >
      {dark && (
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-amber-500/25 blur-3xl" />
      )}

      <div className="relative flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            dark
              ? "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-neutral-950"
              : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/70"
          }`}
        >
          <Icon size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">{title}</h3>

          <p
            className={`mt-1 text-sm leading-6 ${
              dark ? "text-white/55" : "text-slate-500"
            }`}
          >
            {description}
          </p>
        </div>

        <ArrowRight
          size={20}
          className={`mt-1 shrink-0 transition group-hover:translate-x-1 ${
            dark ? "text-amber-300" : "text-slate-400 group-hover:text-amber-600"
          }`}
        />
      </div>
    </Link>
  );
};

export default UserDashboard;