
import {
  Ticket,
  UserRound,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const statusClasses = {
  open: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  "in progress": "bg-violet-50 text-violet-700",
  "in-progress": "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
};

const priorityClasses = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
  critical: "bg-red-50 text-red-700",
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailItem({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="mt-1 break-words text-sm font-semibold text-slate-800">
          {children || "Not available"}
        </div>
      </div>
    </div>
  );
}

export default function AgentTicketInfo({
  ticket,
  currentStatus,
  newStatus,
  setNewStatus,
  onStatusUpdate,
  updatingStatus,
}) {
  const requester =
    ticket?.requesterId &&
    typeof ticket.requesterId === "object"
      ? ticket.requesterId
      : ticket?.user &&
        typeof ticket.user === "object"
      ? ticket.user
      : ticket?.requester &&
        typeof ticket.requester === "object"
      ? ticket.requester
      : {};

  const customerName =
    requester?.Name ||
    requester?.fullName ||
    ticket?.RequesterName ||
    ticket?.customerName ||
    "Customer";

  const customerEmail =
    requester?.Email ||
    ticket?.requesterEmail ||
    ticket?.customerEmail ||
    ticket?.email ||
    "Not available";

  const priority = String(ticket?.priority || "medium").toLowerCase();

  const statusLabel = String(currentStatus || "open")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const isClosed = ["resolved", "closed"].includes(currentStatus);

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Ticket size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {ticket?.ticketNumber || `Ticket #${ticket?._id || ""}`}
            </p>

            <h2 className="mt-1 break-words text-lg font-bold text-slate-900">
              {ticket?.Subject || "Untitled ticket"}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusClasses[currentStatus] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {statusLabel}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  priorityClasses[priority] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Description
          </h3>

          <p className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {ticket?.Description || "No description provided."}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            Ticket information
          </h3>

          <div className="space-y-5">
            <DetailItem icon={UserRound} label="Customer">
              {customerName}
            </DetailItem>

            <DetailItem icon={ShieldCheck} label="Customer email">
              {customerEmail}
            </DetailItem>

            <DetailItem icon={CalendarDays} label="Created">
              {formatDate(ticket?.createdAt)}
            </DetailItem>

            <DetailItem icon={CalendarDays} label="Last updated">
              {formatDate(ticket?.updatedAt)}
            </DetailItem>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Update status
          </h3>

          {isClosed ? (
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
              <AlertCircle size={17} />
              This ticket is {currentStatus}.
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={newStatus || currentStatus}
                onChange={(event) => setNewStatus(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onStatusUpdate}
                disabled={
                  updatingStatus ||
                  !newStatus ||
                  newStatus === currentStatus
                }
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingStatus ? "Updating..." : "Update status"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
