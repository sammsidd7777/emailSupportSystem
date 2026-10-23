
import {
  Ticket,
  CalendarDays,
  Tag,
  UserRound,
  Flag,
  FileText,
  CircleDot,
  ShieldCheck,
  Copy,
  Check,
  Clock3,
} from "lucide-react";
import { useState } from "react";

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }
  return "";
};

const normalize = (value = "") =>
  String(value).replaceAll("_", " ").trim().toLowerCase();

const formatLabel = (value) => {
  const text = String(value || "").trim();
  if (!text) return "Not available";

  return text
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusStyles = {
  open: "bg-sky-50 text-sky-700 ring-sky-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  "in progress": "bg-violet-50 text-violet-700 ring-violet-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

const priorityStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
};

function InfoItem({ icon: Icon, label, value, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="group flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-indigo-200 hover:shadow-md">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          colors[color] || colors.indigo
        }`}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p
          className="mt-1 break-words text-sm font-semibold text-slate-800"
          title={String(value || "")}
        >
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

export default function TicketInfo({ ticket, ticketId }) {
  const [copied, setCopied] = useState(false);

  if (!ticket) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Ticket size={27} />
        </div>
        <h2 className="font-semibold text-slate-800">
          Ticket not found
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ticket details are not available.
        </p>
      </div>
    );
  }

  const id = getValue(ticket, "_id", "id") || ticketId;

  const ticketNumber =
    getValue(
      ticket,
      "TicketNumber",
      "ticketNumber",
      "ticketToken",
      "TicketToken"
    ) ||
    (id ? `TKT-${String(id).slice(-6).toUpperCase()}` : "N/A");

  const token = getValue(
    ticket,
    "token",
    "Token",
    "ticketToken",
    "TicketToken"
  );

  const subject =
    getValue(ticket, "Subject", "subject") || "Untitled ticket";

  const description =
    getValue(ticket, "Description", "description") ||
    "No description provided.";

  const status = normalize(
    getValue(ticket, "Status", "status") || "open"
  );

  const priority = normalize(
    getValue(ticket, "Priority", "priority") || "medium"
  );

  const category = getValue(ticket, "Category", "category");

  const categoryName =
    typeof category === "object"
      ? getValue(category, "Name", "name", "title")
      : category;

  const assignedAgent = getValue(
    ticket,
    "AssignedTo",
    "assignedTo",
    "AssignedAgent",
    "assignedAgent",
    "assignedAgentId"
  );

  const agentName =
    typeof assignedAgent === "object"
      ? getValue(
          assignedAgent,
          "Name",
          "name",
          "FullName",
          "fullName",
          "Email",
          "email"
        )
      : assignedAgent;

  const createdAt = getValue(
    ticket,
    "createdAt",
    "CreatedAt",
    "createdOn"
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(ticketNumber));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="min-w-0 space-y-6">
      {/* Ticket hero */}
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner sm:h-14 sm:w-14">
              <Ticket size={26} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
                <span>Support ticket</span>
                <span className="text-white/30">/</span>
                <span>Details</span>
              </div>

              <h1 className="mt-2 break-words text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                {subject}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy ticket number"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 font-mono text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <CircleDot size={14} />
                  {ticketNumber}
                  {copied ? (
                    <Check size={14} className="text-emerald-300" />
                  ) : (
                    <Copy size={13} className="text-indigo-200" />
                  )}
                </button>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold capitalize ring-1 ring-inset ${
                    statusStyles[status] ||
                    "bg-slate-100 text-slate-700 ring-slate-200"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {status}
                </span>

                <span
                  className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${
                    priorityStyles[priority] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {priority} priority
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-200">
                <CalendarDays size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-200">
                  Created on
                </p>
                <p className="mt-1 break-words text-sm font-medium text-white">
                  {formatDate(createdAt)}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-200">
                <ShieldCheck size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-200">
                  Assigned agent
                </p>
                <p className="mt-1 break-words text-sm font-medium text-white">
                  {formatLabel(agentName || "Not assigned yet")}
                </p>
              </div>
            </div>
          </div>

          {token && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-200">
                Ticket token
              </p>
              <p className="mt-1 break-all font-mono text-sm text-white">
                {token}
              </p>
            </div>
          )}
        </div>
      </div>

   

      {/* Description */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-slate-900">
              Issue description
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Original message submitted with this ticket
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {description}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock3 size={14} />
            <span>Ticket information</span>
          </div>
        </div>
      </div>
    </section>
  );
}
