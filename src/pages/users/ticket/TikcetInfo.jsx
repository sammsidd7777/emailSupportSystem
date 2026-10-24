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

/* Badges sit on a dark panel, so they use translucent colours */
const statusStyles = {
  open: "bg-sky-400/15 text-sky-100 ring-sky-300/25",
  pending: "bg-amber-400/15 text-amber-100 ring-amber-300/25",
  "in progress": "bg-violet-400/15 text-violet-100 ring-violet-300/25",
  resolved: "bg-emerald-400/15 text-emerald-100 ring-emerald-300/25",
  closed: "bg-slate-400/15 text-slate-200 ring-white/15",
};

const priorityDots = {
  low: "bg-slate-400",
  medium: "bg-amber-400",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

function InfoItem({ icon: Icon, label, value, children }) {
  return (
    <div className="flex min-w-0 items-center gap-3.5 px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-700">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>

        {children ?? (
          <p
            className="mt-0.5 break-words text-sm font-semibold text-slate-800"
            title={String(value || "")}
          >
            {value || "Not available"}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TicketInfo({ ticket, ticketId }) {
  const [copied, setCopied] = useState(false);

  if (!ticket) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-amber-200/50 bg-white p-8 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Ticket size={27} />
        </div>
        <h2 className="font-semibold text-slate-800">
          Ticket not found
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          We couldn't find the details for this ticket.
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
    <section className="min-w-0 space-y-5">
      {/* Summary panel */}
      <div className="relative isolate overflow-hidden rounded-2xl border border-amber-200/15 bg-[#0a0907] text-white shadow-[0_18px_40px_rgba(20,15,5,0.25),inset_0_1px_0_rgba(253,234,168,0.12)]">
        <div className="pointer-events-none absolute -right-14 -top-20 -z-10 h-56 w-56 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 -z-10 h-44 w-44 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="p-5 sm:p-6">
          <p className="text-xs text-amber-100/55">Your request</p>

          <h1 className="mt-1.5 break-words text-lg font-semibold leading-snug tracking-tight sm:text-xl">
            {subject}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              title="Copy ticket number"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 font-mono text-xs font-semibold text-amber-100 transition hover:bg-white/20"
            >
              <CircleDot size={14} className="text-amber-300" />
              {ticketNumber}
              {copied ? (
                <Check size={14} className="text-emerald-300" />
              ) : (
                <Copy size={13} className="text-white/50" />
              )}
            </button>

            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold capitalize ring-1 ring-inset ${
                statusStyles[status] ||
                "bg-white/10 text-white ring-white/20"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {status}
            </span>
          </div>

          {token && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur">
              <p className="text-xs text-white/45">Ticket token</p>
              <p className="mt-1 break-all font-mono text-sm text-amber-100">
                {token}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details list */}
      <div className="overflow-hidden rounded-2xl border border-amber-200/50 bg-white shadow-[0_8px_30px_rgba(120,85,10,0.06)]">
        <div className="divide-y divide-amber-100">
          <InfoItem
            icon={Tag}
            label="Category"
            value={formatLabel(categoryName || "General")}
          />

          <InfoItem icon={Flag} label="Priority">
            <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold capitalize text-slate-800">
              <span
                className={`h-2 w-2 rounded-full ${
                  priorityDots[priority] || "bg-slate-400"
                }`}
              />
              {priority}
            </p>
          </InfoItem>

          <InfoItem
            icon={agentName ? ShieldCheck : UserRound}
            label="Assigned agent"
            value={formatLabel(agentName || "Not assigned yet")}
          />

          <InfoItem
            icon={CalendarDays}
            label="Created on"
            value={formatDate(createdAt)}
          />
        </div>
      </div>

      {/* Description */}
      <div className="overflow-hidden rounded-2xl border border-amber-200/50 bg-white shadow-[0_8px_30px_rgba(120,85,10,0.06)]">
        <div className="flex items-center gap-3 border-b border-amber-100 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-700">
            <FileText size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900">
              What you reported
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              The original message sent with this ticket
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {description}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock3 size={14} />
            <span>Submitted {formatDate(createdAt)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}