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
        (ticket.Subject || "").toLowerCase().includes(q) ||
        (ticket.TicketNumber || "").toLowerCase().includes(q) ||
        (ticket.Description || "").toLowerCase().includes(q);

      const matchesStatus =
        status === "all" ||
        (ticket.status || "open").toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, status]);

  const statusStyle = (value) => {
    switch ((value || "open").toLowerCase()) {
      case "resolved":
        return "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
      case "in_progress":
        return "border border-[#d4af37]/40 bg-[#d4af37]/15 text-[#f5d77a]";
      case "closed":
        return "border border-neutral-600 bg-neutral-800 text-neutral-400";
      default:
        return "border border-amber-400/30 bg-amber-400/10 text-amber-300";
    }
  };

  const priorityStyle = (value) => {
    switch ((value || "low").toLowerCase()) {
      case "urgent":
        return "border border-red-400/30 bg-red-500/10 text-red-300";
      case "high":
        return "border border-orange-400/30 bg-orange-500/10 text-orange-300";
      case "medium":
        return "border border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
      default:
        return "border border-neutral-600 bg-neutral-800 text-neutral-400";
    }
  };

  const openTicket = (id) => {
    navigate(`/agent/tickets/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#d4af37]">
              Agent workspace
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              My Assigned Tickets
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              View and manage tickets assigned to your account.
            </p>
          </div>

          <button
            onClick={refetch}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/40 bg-black px-4 py-3 text-sm font-semibold text-[#f5d77a] transition hover:bg-[#d4af37]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60 disabled:opacity-50"
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
            color="bg-gradient-to-br from-[#f5d77a] via-[#d4af37] to-[#9a7420] text-black"
          />
          <SummaryCard
            title="In Progress"
            value={tickets.filter(
              (t) => (t.status || "").toLowerCase() === "in progress"
            ).length}
            icon={<Clock3 size={21} />}
            color="border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"
          />
          <SummaryCard
            title="Resolved"
            value={tickets.filter(
              (t) => (t.status || "").toLowerCase() === "resolved"
            ).length}
            icon={<CheckCircle2 size={21} />}
            color="border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          />
        </section>

        <section className="rounded-2xl border border-[#d4af37]/20 bg-neutral-950 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]/70"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject, ticket number..."
                className="w-full rounded-xl border border-neutral-800 bg-black py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-neutral-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-neutral-950">
          <div className="flex items-center justify-between border-b border-[#d4af37]/15 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-white">Ticket List</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {filteredTickets.length} ticket(s)
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center gap-3 p-12 text-neutral-400">
              <RefreshCw className="animate-spin text-[#d4af37]" size={20} />
              Loading assigned tickets...
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertCircle className="mx-auto text-red-400" size={32} />
              <p className="mt-3 font-semibold text-white">
                Could not load tickets
              </p>
              <button
                onClick={refetch}
                className="mt-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8892b] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d77a]"
              >
                Try Again
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket size={34} className="mx-auto text-[#d4af37]/40" />
              <p className="mt-3 font-semibold text-white">
                No tickets found
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Assigned tickets will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5 p-4 sm:p-6">
              {filteredTickets.map((ticket) => (
                <article
                  key={ticket._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-neutral-900 to-black transition hover:border-[#d4af37]/70 md:flex-row"
                >
                  {/* Ticket body */}
                  <div className="min-w-0 flex-1 p-5 sm:p-6">
                    <h3 className="break-words text-lg font-bold text-white">
                      {ticket?.Subject || "Untitled ticket"}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-400">
                      {ticket.Description || "No description provided."}
                    </p>

                    <p className="mt-3 text-xs text-neutral-600">
                      Created{" "}
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleString()
                        : "date unavailable"}
                    </p>
                  </div>

                  {/* Perforation */}
                  <div className="relative border-t-2 border-dashed border-[#d4af37]/30 md:border-l-2 md:border-t-0">
                    <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-[#d4af37]/30 bg-[#050505]" />
                    <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-[#d4af37]/30 bg-[#050505] md:-bottom-3 md:-left-3 md:right-auto md:top-auto" />
                  </div>

                  {/* Ticket stub */}
                  <div className="flex shrink-0 flex-col justify-between gap-4 bg-[#d4af37]/[0.06] p-5 sm:p-6 md:w-64">
                    <div>
                      <p className="text-[11px] font-semibold text-[#d4af37]/80">
                        Admit one
                      </p>
                      <p className="mt-1 break-all font-mono text-base font-bold text-[#f5d77a]">
                        {ticket.TicketNumber || ticket._id}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
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

                    <button
                      onClick={() => openTicket(ticket._id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8892b] px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-[#d4af37]/10 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d77a]"
                    >
                      View Details
                      <ChevronRight size={17} />
                    </button>
                  </div>
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
    <div className="rounded-2xl border border-[#d4af37]/20 bg-neutral-950 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-400">{title}</p>
        <span className={`rounded-xl p-3 ${color}`}>{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}