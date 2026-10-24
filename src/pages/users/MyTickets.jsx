import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  Search,
  Plus,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock3,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useGetMyTicketsQuery } from "../../services/RTK/ticketApi";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "in progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function MyTickets() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMyTicketsQuery();

  const tickets = Array.isArray(data)
    ? data
    : data?.tickets ??
      data?.data?.tickets ??
      (Array.isArray(data?.data) ? data.data : []);

  const normalizeStatus = (value = "") =>
    String(value).toLowerCase().replaceAll("_", " ").trim();

  const getStatus = (ticket) =>
    normalizeStatus(ticket.status ?? ticket.Status ?? "open");

  const getPriority = (ticket) =>
    String(ticket.priority ?? ticket.Priority ?? "medium").toLowerCase();

  const getSubject = (ticket) =>
    ticket.subject ?? ticket.Subject ?? "Untitled ticket";

  const getId = (ticket) => ticket._id ?? ticket.id;

  const getTicketNumber = (ticket) =>
    ticket.ticketNumber ?? ticket.TicketNumber ?? getId(ticket) ?? "—";

  const getCategory = (ticket) => {
    const category = ticket.category ?? ticket.Category ?? "";
    return typeof category === "object"
      ? category?.name ?? category?.Name ?? "General"
      : category || "General";
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchableText = [
      getTicketNumber(ticket),
      getSubject(ticket),
      getCategory(ticket),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      search.trim().toLowerCase()
    );

    const matchesStatus =
      status === "all" || getStatus(ticket) === status;

    return matchesSearch && matchesStatus;
  });

  const openTickets = tickets.filter((ticket) =>
    ["open", "pending", "in progress"].includes(getStatus(ticket))
  ).length;

  const resolvedTickets = tickets.filter((ticket) =>
    ["resolved", "closed"].includes(getStatus(ticket))
  ).length;

  /* display-only: count shown on each status tab */
  const countFor = (value) =>
    value === "all"
      ? tickets.length
      : tickets.filter((ticket) => getStatus(ticket) === value).length;

  const statusStyle = (value = "") => {
    const styles = {
      open: "bg-blue-50 text-blue-700 ring-blue-200",
      pending: "bg-amber-50 text-amber-700 ring-amber-200",
      "in progress": "bg-violet-50 text-violet-700 ring-violet-200",
      resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      closed: "bg-slate-100 text-slate-600 ring-slate-200",
    };

    return (
      styles[normalizeStatus(value)] ||
      "bg-slate-100 text-slate-600 ring-slate-200"
    );
  };

  const statusRail = (value = "") => {
    const rails = {
      open: "bg-blue-400",
      pending: "bg-amber-400",
      "in progress": "bg-violet-400",
      resolved: "bg-emerald-400",
      closed: "bg-slate-300",
    };

    return rails[normalizeStatus(value)] || "bg-slate-300";
  };

  const priorityStyle = (value = "") => {
    const styles = {
      low: { text: "text-slate-600", dot: "bg-slate-400" },
      medium: { text: "text-amber-700", dot: "bg-amber-400" },
      high: { text: "text-orange-700", dot: "bg-orange-500" },
      urgent: { text: "text-red-700", dot: "bg-red-500" },
    };

    return (
      styles[String(value).toLowerCase()] || {
        text: "text-slate-600",
        dot: "bg-slate-400",
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const errorMessage =
    error?.data?.message ||
    error?.error ||
    error?.message ||
    "Unable to load tickets. Please try again.";

  const goldButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 text-sm font-bold text-neutral-950 shadow-[0_10px_30px_rgba(217,160,40,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60";

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      {/* ---------- Heading band ---------- */}
      <header className="relative overflow-hidden rounded-[24px] border border-amber-200/15 bg-[#0a0907] p-6 text-white shadow-[0_22px_50px_rgba(20,15,5,0.3),inset_0_1px_0_rgba(253,234,168,0.12)] sm:p-8">
        <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-amber-600/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 right-16 h-60 w-60 rounded-full bg-yellow-500/15 blur-[100px]" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              My tickets
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
              Every request you've raised, in one place. Search, filter and
              jump back into any conversation.
            </p>

            {!isLoading && !isError && (
              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                <HeaderStat
                  icon={<Ticket size={16} />}
                  label="Total"
                  value={tickets.length}
                />
                <HeaderStat
                  icon={<Clock3 size={16} />}
                  label="Active"
                  value={openTickets}
                />
                <HeaderStat
                  icon={<CheckCircle2 size={16} />}
                  label="Resolved"
                  value={resolvedTickets}
                />
              </div>
            )}
          </div>

          <Link
            to="/user/create-ticket"
            className={`${goldButton} min-h-11 self-start px-5 py-3 lg:self-auto`}
          >
            <Plus size={17} />
            New request
          </Link>
        </div>
      </header>

      {/* ---------- Loading ---------- */}
      {isLoading && (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-amber-200/50 bg-white shadow-sm">
          <LoaderCircle size={28} className="animate-spin text-amber-600" />
          <p className="mt-3 text-sm text-slate-500">
            Loading your tickets...
          </p>
        </div>
      )}

      {/* ---------- Error ---------- */}
      {!isLoading && isError && (
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle size={22} />
          </div>

          <h2 className="mt-4 font-semibold text-slate-900">
            We couldn't load your tickets
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={refetch}
            disabled={isFetching}
            className={`${goldButton} mt-5 px-5 py-2.5`}
          >
            <RefreshCw
              size={15}
              className={isFetching ? "animate-spin" : ""}
            />
            Retry
          </button>
        </div>
      )}

      {/* ---------- Content ---------- */}
      {!isLoading && !isError && (
        <>
          {/* Search + filters */}
          <section className="rounded-2xl border border-amber-200/50 bg-white p-4 shadow-[0_6px_24px_rgba(120,85,10,0.05)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by ID, subject or category"
                  aria-label="Search tickets"
                  className="w-full rounded-xl border border-amber-200/70 bg-white py-3 pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 hover:border-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-300/20"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={refetch}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-amber-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={isFetching ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {/* Status tabs */}
            <div
              role="tablist"
              aria-label="Filter by status"
              className="mt-4 flex gap-2 overflow-x-auto pb-1"
            >
              <SlidersHorizontal
                size={16}
                className="mr-1 mt-2.5 shrink-0 text-slate-400"
              />

              {statusTabs.map((tab) => {
                const active = status === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatus(tab.value)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-amber-300 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
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
                      {countFor(tab.value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Ticket list */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">
                  {filteredTickets.length}
                </span>{" "}
                {filteredTickets.length === 1 ? "ticket" : "tickets"} found
              </p>

              {isFetching && !isLoading && (
                <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <LoaderCircle
                    size={15}
                    className="animate-spin text-amber-600"
                  />
                  Updating
                </span>
              )}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-300/60 bg-white/60 px-5 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700">
                  <Ticket size={26} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {tickets.length === 0
                    ? "No tickets yet"
                    : "Nothing matches your search"}
                </h3>

                <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
                  {tickets.length === 0
                    ? "Raise your first request and it will show up here."
                    : "Try a different keyword or switch to another status."}
                </p>

                {tickets.length === 0 && (
                  <Link
                    to="/user/create-ticket"
                    className={`${goldButton} mt-5 px-5 py-3`}
                  >
                    <Plus size={16} />
                    Raise a request
                  </Link>
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredTickets.map((ticket) => {
                  const id = getId(ticket);
                  const ticketNumber = getTicketNumber(ticket);
                  const subject = getSubject(ticket);
                  const priority = getPriority(ticket);
                  const ticketStatus = getStatus(ticket);
                  const pStyle = priorityStyle(priority);

                  return (
                    <li
                      key={id ?? ticketNumber}
                      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-amber-200/50 bg-white py-4 pl-6 pr-4 shadow-[0_6px_24px_rgba(120,85,10,0.04)] transition hover:border-amber-300 hover:shadow-[0_14px_36px_rgba(120,85,10,0.1)] md:flex-row md:items-center md:pr-5"
                    >
                      <span
                        className={`absolute inset-y-0 left-0 w-1.5 ${statusRail(ticketStatus)}`}
                      />

                      {/* Main info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                            {ticketNumber}
                          </span>

                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {getCategory(ticket)}
                          </span>
                        </div>

                        <p className="mt-2 truncate text-base font-semibold text-slate-800">
                          {subject}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Opened{" "}
                          {formatDate(ticket.createdAt ?? ticket.CreatedAt)}
                        </p>
                      </div>

                      {/* Meta + action */}
                      <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <span
                          className={`inline-flex items-center gap-2 text-sm font-medium capitalize ${pStyle.text}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${pStyle.dot}`} />
                          {priority}
                        </span>

                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle(ticketStatus)}`}
                        >
                          {ticketStatus}
                        </span>

                        {id ? (
                          <Link
                            to={`/user/tickets/${id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100/70 hover:text-amber-900"
                          >
                            View
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

            {filteredTickets.length > 0 && (
              <p className="mt-4 text-center text-xs text-slate-400">
                Showing {filteredTickets.length} of {tickets.length} tickets
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function HeaderStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/10 text-amber-300">
        {icon}
      </div>

      <div className="leading-none">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-white/45">{label}</p>
      </div>
    </div>
  );
}