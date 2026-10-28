
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useGetAllTicketsQuery } from "../../services/RTK/adminApi";

export default function AllTickets() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllTicketsQuery();

  const tickets = Array.isArray(data?.totalTicket)
    ? data.totalTicket
    : [];

  const getStatus = (ticket) =>
    String(ticket.Status || ticket.status || "open").toLowerCase();

  const getPriority = (ticket) =>
    String(ticket.Priority || ticket.priority || "medium").toLowerCase();

  const filteredTickets = tickets.filter((ticket) => {
    const query = search.toLowerCase().trim();

    const requesterEmail = String(
      ticket.RequesterEmail ||
        ticket.requesterEmail ||
        ticket.RequesterId?.Email ||
        ticket.requesterId?.email ||
        ""
    ).toLowerCase();

    const ticketNumber = String(
      ticket.TicketNumber || ticket.ticketNumber || ""
    ).toLowerCase();

    const subject = String(
      ticket.Subject || ticket.subject || ""
    ).toLowerCase();

    const matchesSearch =
      ticketNumber.includes(query) ||
      subject.includes(query) ||
      requesterEmail.includes(query);

    const matchesStatus =
      status === "all" || getStatus(ticket) === status;

    const matchesPriority =
      priority === "all" || getPriority(ticket) === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination calculations
  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedTickets = filteredTickets.slice(
    startIndex,
    endIndex
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, priority, pageSize]);

  // Keep current page valid if tickets are removed or updated
  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

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
    low: "bg-neutral-100 text-neutral-600",
    medium: "bg-sky-50 text-sky-700",
    high: "bg-orange-50 text-orange-700",
    urgent: "bg-red-50 text-red-700",
  };

  const statusClasses = {
    open: "bg-sky-50 text-sky-700 ring-sky-200",
    "in-progress": "bg-amber-50 text-amber-700 ring-amber-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    closed: "bg-neutral-100 text-neutral-500 ring-neutral-200",
  };

  const getRequester = (ticket) => {
    const requester = ticket.RequesterId || ticket.requesterId;

    return requester && typeof requester === "object"
      ? requester
      : null;
  };

  const getAgent = (ticket) => {
    const agent = ticket.AssignedTo || ticket.assignedTo;

    return agent && typeof agent === "object"
      ? agent
      : null;
  };

  const goToPage = (page) => {
    setCurrentPage(
      Math.min(Math.max(page, 1), Math.max(totalPages, 1))
    );
  };

  return (
    <div className="min-h-full">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#0f3d28] sm:text-5xl">
              All Tickets
            </h1>
            <p className="mt-2 text-sm text-neutral-500 sm:text-base">
              Monitor and manage all customer support tickets.
            </p>
          </div>

          <button
            onClick={refetch}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0d3b27]/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            featured
            title="Total Tickets"
            value={data?.totalCount ?? tickets.length}
            icon={<Ticket size={20} />}
          />
          <StatCard
            title="Open Tickets"
            value={openCount}
            icon={<AlertCircle size={20} />}
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock size={20} />}
          />
          <StatCard
            title="Resolved"
            value={resolvedCount}
            icon={<CheckCircle size={20} />}
          />
        </div>

        {/* Error */}
        {isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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

        {/* Search and filters */}
        <div className="grid grid-cols-1 gap-3 rounded-3xl bg-white p-4 sm:p-5 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket, subject, email..."
              className="w-full rounded-full border border-neutral-200 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 hover:border-[#1f7a4d]/50 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-full border border-neutral-200 bg-[#f7f7f5] px-5 py-3 text-sm font-medium text-neutral-700 outline-none transition focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
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
            className="rounded-full border border-neutral-200 bg-[#f7f7f5] px-5 py-3 text-sm font-medium text-neutral-700 outline-none transition focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Tickets table */}
        <div className="overflow-hidden rounded-3xl bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 p-12 text-neutral-500">
              <RefreshCw
                size={18}
                className="animate-spin text-[#1f7a4d]"
              />
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#1f7a4d]/10 text-[#1f7a4d]">
                <Ticket size={28} />
              </div>
              <h3 className="font-semibold text-neutral-800">
                No tickets found
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto p-3 sm:p-4">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-[#f7f7f5] text-xs text-neutral-500">
                  <tr>
                    <th className="rounded-l-2xl px-5 py-3.5 font-medium">
                      Ticket
                    </th>
                    <th className="px-5 py-3.5 font-medium">
                      Requester
                    </th>
                    <th className="px-5 py-3.5 font-medium">
                      Assigned Agent
                    </th>
                    <th className="px-5 py-3.5 font-medium">
                      Priority
                    </th>
                    <th className="px-5 py-3.5 font-medium">
                      Status
                    </th>
                    <th className="px-5 py-3.5 font-medium">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {paginatedTickets.map((ticket) => {
                    const requester = getRequester(ticket);
                    const agent = getAgent(ticket);
                    const ticketStatus = getStatus(ticket);
                    const ticketPriority = getPriority(ticket);

                    const ticketNumber =
                      ticket.TicketNumber ||
                      ticket.ticketNumber ||
                      ticket._id;

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
                        onClick={() =>
                          navigate(
                            `/admin/tickets/${ticket._id}`
                          )
                        }
                        className="cursor-pointer transition hover:bg-[#f7f7f5]"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#1f7a4d]/10 px-2.5 py-1 text-xs font-bold text-[#1f7a4d]">
                            {ticketNumber}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          <p className="font-medium text-neutral-800">
                            {requesterName}
                          </p>
                          <p className="text-neutral-500">
                            {requesterEmail}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {agentName}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              priorityClasses[ticketPriority] ||
                              "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {ticketPriority}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                              statusClasses[ticketStatus] ||
                              "bg-neutral-100 text-neutral-500 ring-neutral-200"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {ticketStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-500">
                          {createdAt
                            ? new Date(createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-col gap-2 text-sm text-neutral-500 sm:flex-row sm:items-center sm:gap-4">
              <p>
                Showing{" "}
                <span className="font-semibold text-[#0f3d28]">
                  {startIndex + 1}–{endIndex}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#0f3d28]">
                  {totalItems}
                </span>{" "}
                tickets
              </p>

              <div className="flex items-center gap-2">
                <label htmlFor="pageSize">Rows per page</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-neutral-200 bg-[#f7f7f5] px-2 py-1.5 text-sm text-neutral-700 outline-none focus:border-[#1f7a4d]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <PaginationButton
                label="First page"
                disabled={safeCurrentPage === 1}
                onClick={() => goToPage(1)}
              >
                <ChevronsLeft size={17} />
              </PaginationButton>

              <PaginationButton
                label="Previous page"
                disabled={safeCurrentPage === 1}
                onClick={() => goToPage(safeCurrentPage - 1)}
              >
                <ChevronLeft size={17} />
              </PaginationButton>

              {(() => {
                const pages = [];
                let start = Math.max(1, safeCurrentPage - 2);
                let end = Math.min(totalPages, start + 4);

                start = Math.max(1, end - 4);

                for (let page = start; page <= end; page++) {
                  pages.push(
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      aria-current={
                        page === safeCurrentPage ? "page" : undefined
                      }
                      className={`h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition ${
                        page === safeCurrentPage
                          ? "bg-gradient-to-r from-[#1b7048] to-[#0d3b27] text-white shadow-sm"
                          : "text-neutral-600 hover:bg-[#1f7a4d]/10 hover:text-[#0f3d28]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }

                return pages;
              })()}

              <PaginationButton
                label="Next page"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => goToPage(safeCurrentPage + 1)}
              >
                <ChevronRight size={17} />
              </PaginationButton>

              <PaginationButton
                label="Last page"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => goToPage(totalPages)}
              >
                <ChevronsRight size={17} />
              </PaginationButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaginationButton({ children, disabled, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:border-[#1f7a4d]/30 hover:bg-[#1f7a4d]/10 hover:text-[#0f3d28] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function StatCard({ title, value, icon, featured = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 ${
        featured
          ? "bg-gradient-to-br from-[#1b7048] via-[#115236] to-[#0a2e1e] text-white"
          : "bg-white text-[#0f3d28]"
      }`}
    >
      {featured && (
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-white/10" />
      )}

      <div className="flex items-start justify-between gap-3">
        <span className="text-base font-medium">{title}</span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            featured
              ? "bg-white text-[#0f3d28]"
              : "bg-[#1f7a4d]/10 text-[#1f7a4d]"
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-4 text-5xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}
