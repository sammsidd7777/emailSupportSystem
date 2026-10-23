
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

  const statusStyle = (value = "") => {
    const styles = {
      open: "bg-blue-50 text-blue-700",
      pending: "bg-amber-50 text-amber-700",
      "in progress": "bg-violet-50 text-violet-700",
      resolved: "bg-emerald-50 text-emerald-700",
      closed: "bg-gray-100 text-gray-600",
    };

    return styles[normalizeStatus(value)] || "bg-gray-100 text-gray-600";
  };

  const priorityStyle = (value = "") => {
    const styles = {
      low: "text-gray-600",
      medium: "text-blue-700",
      high: "text-orange-700",
      urgent: "text-red-700",
    };

    return styles[String(value).toLowerCase()] || "text-gray-600";
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

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">
        {/* Page heading */}
        <header className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Support</span>
              <span>/</span>
              <span className="text-gray-700">My Tickets</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              My Tickets
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              View and manage your support requests.
            </p>
          </div>

          <Link
            to="/user/create-ticket"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 sm:self-auto"
          >
            <Plus size={17} />
            Create ticket
          </Link>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white">
            <LoaderCircle size={28} className="animate-spin text-blue-700" />
            <p className="mt-3 text-sm text-gray-500">
              Loading your tickets...
            </p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <div className="rounded-lg border border-red-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={22} />
            </div>

            <h2 className="mt-4 font-semibold text-gray-900">
              Could not load tickets
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={isFetching ? "animate-spin" : ""}
              />
              Try again
            </button>
          </div>
        )}

        {/* Dashboard content */}
        {!isLoading && !isError && (
          <>
            {/* Summary cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                title="Total tickets"
                value={tickets.length}
                icon={<Ticket size={19} />}
                color="blue"
              />

              <SummaryCard
                title="Active tickets"
                value={openTickets}
                icon={<Clock3 size={19} />}
                color="amber"
              />

              <SummaryCard
                title="Resolved tickets"
                value={resolvedTickets}
                icon={<CheckCircle2 size={19} />}
                color="green"
              />
            </section>

            {/* Search and filters */}
            <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Find a ticket
                </h2>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by ticket ID, subject or category"
                    aria-label="Search tickets"
                    className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Filter by status"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-600 lg:w-48"
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="in progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  type="button"
                  onClick={refetch}
                  disabled={isFetching}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    className={isFetching ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </section>

            {/* Tickets table */}
            <section className="w-full min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex flex-col justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    All tickets
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredTickets.length}{" "}
                    {filteredTickets.length === 1 ? "result" : "results"}
                  </p>
                </div>

                {isFetching && !isLoading && (
                  <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                    <LoaderCircle
                      size={15}
                      className="animate-spin text-blue-700"
                    />
                    Updating
                  </span>
                )}
              </div>

              {filteredTickets.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <Ticket size={23} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-gray-900">
                    {tickets.length === 0
                      ? "No tickets yet"
                      : "No matching tickets"}
                  </h3>

                  <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-500">
                    {tickets.length === 0
                      ? "Create a support ticket to get help with your issue."
                      : "Try another search term or select a different status."}
                  </p>

                  {tickets.length === 0 && (
                    <Link
                      to="/user/create-ticket"
                      className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                      <Plus size={16} />
                      Create ticket
                    </Link>
                  )}
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Ticket ID
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Subject
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Priority
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Created
                        </th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredTickets.map((ticket) => {
                        const id = getId(ticket);
                        const ticketNumber = getTicketNumber(ticket);
                        const subject = getSubject(ticket);
                        const priority = getPriority(ticket);
                        const ticketStatus = getStatus(ticket);

                        return (
                          <tr
                            key={id ?? ticketNumber}
                            className="transition hover:bg-gray-50"
                          >
                            <td className="whitespace-nowrap px-5 py-4">
                              <span className="font-medium text-blue-700">
                                {ticketNumber}
                              </span>
                            </td>

                            <td className="max-w-xs px-5 py-4">
                              <p className="truncate font-medium text-gray-900">
                                {subject}
                              </p>
                              <p className="mt-1 truncate text-xs text-gray-500">
                                {getCategory(ticket)}
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <span
                                className={`text-sm font-medium capitalize ${priorityStyle(priority)}`}
                              >
                                {priority}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle(ticketStatus)}`}
                              >
                                {ticketStatus}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                              {formatDate(
                                ticket.createdAt ?? ticket.CreatedAt
                              )}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              {id ? (
                                <Link
                                  to={`/user/tickets/${id}`}
                                  className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-900"
                                >
                                  View
                                  <ArrowRight size={15} />
                                </Link>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredTickets.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-gray-500">
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      border: "border-l-blue-600",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      border: "border-l-amber-500",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      border: "border-l-emerald-600",
    },
  };

  const style = styles[color] ?? styles.blue;

  return (
    <div
      className={`min-w-0 rounded-lg border border-gray-200 border-l-4 ${style.border} bg-white p-5`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${style.icon}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
    </div>
  );
}
