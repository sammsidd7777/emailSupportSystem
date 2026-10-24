
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  useGetAgentTicketByIdQuery,
  useReplyToTicketMutation,
  useUpdateTicketStatusMutation,
} from "../../services/RTK/agentApi";

import AgentTicketInfo from "./AgentTicketInfo";
import AgentTicketChat from "./AgentTicketChat";

export default function AgentTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAgentTicketByIdQuery(ticketId, {
    skip: !ticketId,
  });

  const [replyToTicket, { isLoading: sending }] =
    useReplyToTicketMutation();

  const [updateTicketStatus, { isLoading: updatingStatus }] =
    useUpdateTicketStatusMutation();

  // Support common API response formats.
  const ticket =
    data?.ticket ??
    data?.data?.ticket ??
    data?.data?.data?.ticket ??
    (data?.messages && !Array.isArray(data.messages)
      ? data.messages
      : null) ??
    data?.data?.data ??
    data?.data ??
    null;

  const messages =
    ticket?.messages ??
    data?.messages ??
    data?.data?.messages ??
    data?.data?.data?.messages ??
    [];

  const normalizedMessages = Array.isArray(messages) ? messages : [];

  const currentStatus = String(ticket?.status ?? "open").toLowerCase();

  const isClosed = ["resolved", "closed"].includes(currentStatus);

  const handleReply = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !ticketId || sending || isClosed) return;

    try {
      setFeedback("");

      await replyToTicket({
        ticketId,
        message: trimmedMessage,
      }).unwrap();

      setMessage("");
      setFeedback("Reply sent successfully.");

      await refetch();
    } catch (err) {
      setFeedback(
        err?.data?.message ||
          err?.data?.error ||
          "Unable to send reply. Please try again."
      );
    }
  };

  const handleStatusUpdate = async () => {
    if (!ticketId || !newStatus || newStatus === currentStatus) return;

    try {
      setFeedback("");

      await updateTicketStatus({
        ticketId,
        status: newStatus,
      }).unwrap();

      setFeedback("Ticket status updated successfully.");
      await refetch();
    } catch (err) {
      setFeedback(
        err?.data?.message ||
          err?.data?.error ||
          "Unable to update ticket status."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-600">
        <LoaderCircle className="animate-spin" size={24} />
        <span>Loading ticket details...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle size={24} />
          <h2 className="font-semibold">Unable to load ticket</h2>
        </div>

        <p className="mt-2 text-sm text-red-600">
          {error?.data?.message || "Please check your connection or permissions."}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-slate-600">
        Ticket not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to tickets
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Ticket details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review ticket information and communicate with the customer.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {feedback && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
          >
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)]">
          <AgentTicketInfo
            ticket={ticket}
            currentStatus={currentStatus}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            onStatusUpdate={handleStatusUpdate}
            updatingStatus={updatingStatus}
          />

          <AgentTicketChat
            messages={normalizedMessages}
            ticket={ticket}
            message={message}
            setMessage={setMessage}
            onReply={handleReply}
            sending={sending}
            isClosed={isClosed}
          />
        </div>
      </div>
    </main>
  );
}
