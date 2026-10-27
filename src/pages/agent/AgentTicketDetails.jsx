import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  RefreshCw,
  MessageSquare,
  Clock3,
  UserRound,
  AlertCircle,
  CheckCircle2,
  Ticket,
  CalendarDays,
  ShieldCheck,
  Headphones,
} from "lucide-react";

import {
  useGetAgentTicketByIdQuery,
  useReplyToTicketMutation,
  useUpdateTicketStatusMutation,
} from "../../services/RTK/agentApi";

export default function AgentTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAgentTicketByIdQuery(ticketId, {
    skip: !ticketId,
  });

  const [replyToTicket, { isLoading: sending }] =
    useReplyToTicketMutation();

  const [updateTicketStatus, { isLoading: updatingStatus }] =
    useUpdateTicketStatusMutation();

  // Support API response wrappers
  const ticket =
    data?.ticket ||
    data?.data?.ticket ||
    data?.data?.data?.ticket ||
    null;

  // Messages are nested in the TICKETMESSAGE document
  const rawMessages = ticket?.Messages;

  const messages = Array.isArray(rawMessages)
    ? rawMessages
    : Array.isArray(rawMessages?.Messages)
      ? rawMessages.Messages
      : [];

  const currentStatus = String(
    ticket?.Status || ticket?.status || "open"
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  const currentPriority =
    ticket?.Priority || ticket?.priority || "low";

  const isClosed = ["resolved", "closed"].includes(currentStatus);

  const requester =
    ticket?.RequesterEmail ||
    ticket?.requesterEmail ||
    ticket?.RequesterId?.Email ||
    ticket?.RequesterId?.Name ||
    ticket?.requesterId?.email ||
    ticket?.requester?.email ||
    "Customer";

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
  };

  const handleReply = async (e) => {
  e.preventDefault();

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    showFeedback("error", "Please enter a reply.");
    return;
  }

  try {
    await replyToTicket({
      ticketId,
      ticketNumber: ticket.TicketNumber,
      message: trimmedMessage,
    }).unwrap();

    setMessage("");
    showFeedback("success", "Reply sent successfully.");
    await refetch();
  } catch (error) {
    showFeedback(
      "error",
      error?.data?.message || "Failed to send reply."
    );
  }
};

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!newStatus || newStatus === currentStatus) {
      showFeedback("error", "Please select a different status.");
      return;
    }

    try {
      await updateTicketStatus({
        ticketId,
        status: newStatus,
      }).unwrap();

      setNewStatus("");
      showFeedback("success", "Ticket status updated successfully.");

      await refetch();
    } catch (error) {
      showFeedback(
        "error",
        error?.data?.message ||
          error?.data?.error ||
          "Failed to update ticket status."
      );
    }
  };

  const statusStyle = (status) => {
    switch (
      String(status || "open")
        .toLowerCase()
        .replace(/\s+/g, "_")
    ) {
      case "resolved":
        return "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30";

      case "in_progress":
      case "progress":
        return "bg-[#d4af37]/15 text-[#f5d77a] ring-[#d4af37]/40";

      case "closed":
        return "bg-neutral-800 text-neutral-400 ring-neutral-600";

      default:
        return "bg-amber-400/10 text-amber-300 ring-amber-400/30";
    }
  };

  const formatStatus = (status) =>
    String(status || "open")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const priorityStyle = (priority) => {
    switch (String(priority || "low").toLowerCase()) {
      case "urgent":
        return "bg-red-500/10 text-red-300 ring-red-400/30";
      case "high":
        return "bg-orange-500/10 text-orange-300 ring-orange-400/30";
      case "medium":
        return "bg-yellow-400/10 text-yellow-200 ring-yellow-400/30";
      default:
        return "bg-neutral-800 text-neutral-400 ring-neutral-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] p-5 sm:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-12 w-40 rounded-xl bg-neutral-900" />
          <div className="h-64 rounded-3xl bg-neutral-950 ring-1 ring-[#d4af37]/15" />
          <div className="h-96 rounded-3xl bg-neutral-950 ring-1 ring-[#d4af37]/15" />
        </div>
      </div>
    );
  }

  if (isError || !ticket?._id) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#050505] p-5">
        <div className="w-full max-w-md rounded-3xl border border-[#d4af37]/25 bg-neutral-950 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 text-red-400">
            <AlertCircle size={32} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Unable to load ticket
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            The ticket may not exist, or you may not have permission to access it.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-[#d4af37]/40 px-4 py-2.5 text-sm font-semibold text-[#f5d77a] hover:bg-[#d4af37]/10"
            >
              Retry
            </button>

            <button
              type="button"
              onClick={() => navigate("/agent/my-tickets")}
              className="rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8892b] px-4 py-2.5 text-sm font-semibold text-black"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 bg-[#050505]">
      <header className="sticky top-0 z-20 border-b border-[#d4af37]/20 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-7">
          <button
            type="button"
            onClick={() => navigate("/agent/my-tickets")}
            className="inline-flex items-center gap-2.5 rounded-xl border border-[#d4af37]/30 bg-black px-4 py-2.5 text-sm font-semibold text-neutral-300 hover:bg-[#d4af37]/10 hover:text-[#f5d77a]"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Back to My Tickets</span>
            <span className="sm:hidden">Back</span>
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8892b] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-7">
        {/* Ticket overview */}
        <section className="overflow-hidden rounded-3xl border border-[#d4af37]/30 border-t-[3px] border-t-[#d4af37] bg-gradient-to-br from-neutral-900 to-black">
          <div className="flex flex-col xl:flex-row">
            <div className="min-w-0 flex-1 p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37]/10 px-3.5 py-2 text-xs font-bold text-[#f5d77a] ring-1 ring-inset ring-[#d4af37]/40">
                  <Ticket size={15} />
                  #{ticket.TicketNumber || ticket._id}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyle(currentStatus)}`}
                >
                  {formatStatus(currentStatus)}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${priorityStyle(currentPriority)}`}
                >
                  {formatStatus(currentPriority)} Priority
                </span>
              </div>

              <h1 className="mt-6 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {ticket.Subject || ticket.subject || "Untitled ticket"}
              </h1>

              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-400 sm:text-base">
                {ticket.Description ||
                  ticket.description ||
                  "No description provided."}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#d4af37]/15 bg-black p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                    <CalendarDays size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500">Created on</p>
                    <p className="mt-1 break-words text-sm font-semibold text-neutral-200">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#d4af37]/15 bg-black p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                    <UserRound size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500">Requested by</p>
                    <p className="mt-1 break-words text-sm font-semibold text-neutral-200">
                      {requester}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="flex w-full flex-col border-t-2 border-dashed border-[#d4af37]/30 bg-[#d4af37]/[0.06] p-5 sm:p-8 xl:w-[340px] xl:shrink-0 xl:border-l-2 xl:border-t-0">
              <p className="text-[11px] font-semibold text-[#d4af37]/80">
                Ticket reference
              </p>
              <p className="mt-1 break-all font-mono text-base font-bold text-[#f5d77a]">
                {ticket.TicketNumber || ticket._id}
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5d77a] via-[#d4af37] to-[#9a7420] text-black">
                  <CheckCircle2 size={21} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Manage Status
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500">
                    Update ticket progress
                  </p>
                </div>
              </div>

              <form onSubmit={handleStatusUpdate} className="mt-5 space-y-3">
                <label
                  htmlFor="ticket-status"
                  className="block text-xs font-semibold text-neutral-300"
                >
                  Ticket status
                </label>

                <select
                  id="ticket-status"
                  value={newStatus || currentStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-3 text-sm text-white outline-none focus:border-[#d4af37] disabled:opacity-60"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  type="submit"
                  disabled={
                    updatingStatus ||
                    !newStatus ||
                    newStatus === currentStatus
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8892b] px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-none disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  {updatingStatus ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {updatingStatus ? "Updating..." : "Update Status"}
                </button>
              </form>

              <div className="mt-auto border-t border-[#d4af37]/15 pt-4">
                <div className="flex items-start gap-2 text-xs leading-5 text-neutral-500">
                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-[#d4af37]"
                  />
                  Changes are saved to your ticket record.
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Feedback */}
        {feedback.text && (
          <div
            role="status"
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              feedback.type === "success"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-red-400/30 bg-red-500/10 text-red-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={20} className="shrink-0" />
            ) : (
              <AlertCircle size={20} className="shrink-0" />
            )}

            <p className="flex-1 text-sm font-medium">{feedback.text}</p>

            <button
              type="button"
              onClick={() => setFeedback({ type: "", text: "" })}
              className="rounded-lg px-2 text-lg leading-none hover:bg-white/10"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* Conversation */}
        <section className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-neutral-950">
          <div className="flex flex-col justify-between gap-4 border-b border-[#d4af37]/15 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37]/10 text-[#d4af37]">
                <MessageSquare size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Conversation
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Customer and support messages
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-black px-3.5 py-2 text-xs font-semibold text-[#f5d77a] ring-1 ring-inset ring-[#d4af37]/30">
              <MessageSquare size={14} />
              {messages.length}{" "}
              {messages.length === 1 ? "message" : "messages"}
            </div>
          </div>

          <div className="max-h-[650px] min-h-64 space-y-6 overflow-y-auto bg-black p-4 sm:p-7">
            {messages.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d4af37]/30 bg-neutral-950 px-5 text-center">
                <MessageSquare size={26} className="text-[#d4af37]" />
                <h3 className="mt-4 font-bold text-white">
                  No messages yet
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                  Start the conversation by sending a helpful reply to the customer.
                </p>
              </div>
            ) : (
              messages.map((item, index) => {
                const role = String(item.SenderRole || "")
                  .toLowerCase()
                  .replace(/[\s_-]/g, "");

                const isAgent = [
                  "supportagent",
                  "agent",
                  "admin",
                ].includes(role);

                const senderName =
                  item.SenderEmail ||
                  item.SenderId?.Email ||
                  item.SenderId?.Name ||
                  (isAgent ? "Support Agent" : "Customer");

                const body =
                  item.Body || item.message || item.text || item.content || "";

                return (
                  <div
                    key={item._id || `${item.createdAt || "message"}-${index}`}
                    className={`flex items-end gap-3 ${
                      isAgent ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isAgent && (
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-400 sm:flex">
                        <UserRound size={17} />
                      </div>
                    )}

                    <div
                      className={`flex min-w-0 max-w-[90%] flex-col sm:max-w-[75%] ${
                        isAgent ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
                        <span className="text-xs font-bold text-neutral-200">
                          {senderName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                          <Clock3 size={11} />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3.5 ${
                          isAgent
                            ? "rounded-br-md bg-gradient-to-br from-[#e6c35c] to-[#b8892b] text-black"
                            : "rounded-bl-md border border-neutral-800 bg-neutral-900 text-neutral-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {body}
                        </p>
                      </div>
                    </div>

                    {isAgent && (
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5d77a] via-[#d4af37] to-[#9a7420] text-black sm:flex">
                        <Headphones size={17} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Reply composer */}
          <div className="border-t border-[#d4af37]/20 bg-neutral-950 p-4 sm:p-7">
            {isClosed ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-amber-200">
                <AlertCircle size={20} />
                <div>
                  <p className="font-bold">
                    This ticket is {formatStatus(currentStatus)}.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-300/80">
                    Replies are disabled for resolved or closed tickets.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReply}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                    <Headphones size={19} />
                  </div>
                  <div>
                    <label
                      htmlFor="agent-reply"
                      className="block text-sm font-bold text-white"
                    >
                      Write a reply
                    </label>
                    <p className="mt-1 text-xs text-neutral-500">
                      Your response will be added to the conversation.
                    </p>
                  </div>
                </div>

                <textarea
                  id="agent-reply"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to the customer..."
                  disabled={sending}
                  className="w-full resize-y rounded-2xl border border-neutral-800 bg-black p-4 text-sm leading-6 text-white outline-none placeholder:text-neutral-600 focus:border-[#d4af37] disabled:opacity-60"
                />

                <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-xs leading-5 text-neutral-500">
                    Be clear, professional and helpful.
                  </p>
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8892b] px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-none disabled:bg-neutral-800 disabled:text-neutral-500"
                  >
                    {sending ? (
                      <RefreshCw size={17} className="animate-spin" />
                    ) : (
                      <Send size={17} />
                    )}
                    {sending ? "Sending reply..." : "Send Reply"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}