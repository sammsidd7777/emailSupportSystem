
import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Ticket,
  MessageCircle,
} from "lucide-react";

import { useGetTicketByIdQuery } from "../../services/RTK/userApi";

import TicketInfo from "./ticket/TikcetInfo";
import TicketChat from "./ticket/TicketChat";
import ChatInput from "./ticket/ChatInput";

const getTicketFromResponse = (result) => {
  const candidates = [
    result?.ticket,
    result?.data?.ticket,
    result?.data?.data?.ticket,
    result?.data,
    result?.ticketData,
    result,
  ];

  return candidates.find(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (item._id || item.id || item.ticketNumber || item.TicketNumber)
  );
};

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }

  return "";
};

const normalize = (value = "") =>
  String(value).toLowerCase().replaceAll("_", " ").trim();

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <LoaderCircle
          size={34}
          className="mx-auto animate-spin text-indigo-600"
        />
        <h2 className="mt-4 font-bold text-slate-900">
          Loading ticket
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Fetching your ticket information...
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle size={32} className="mx-auto text-red-500" />

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Unable to load ticket
        </h2>

        <p className="mt-2 break-words text-sm leading-6 text-slate-500">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>

        <div>
          <Link
            to="/user/my-tickets"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={15} />
            Back to My Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TicketDetail() {
  const { ticketId } = useParams();

  const {
    data: ticketResult,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTicketByIdQuery(ticketId, {
    skip: !ticketId,
  });

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!ticketId) {
    return (
      <ErrorScreen
        message="Ticket ID is missing from the URL."
        onRetry={() => window.history.back()}
      />
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  const ticket = getTicketFromResponse(ticketResult);

  if (isError && !ticket) {
    return (
      <ErrorScreen
        message={
          error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "Something went wrong. Please try again."
        }
        onRetry={handleRetry}
      />
    );
  }

  if (!ticket) {
    return (
      <ErrorScreen
        message="Ticket details were not found."
        onRetry={handleRetry}
      />
    );
  }

  const status = normalize(
    getValue(ticket, "status", "Status") || "open"
  );

  const isClosed = ["closed", "resolved"].includes(status);

  const ticketNumber =
    getValue(ticket, "ticketNumber", "TicketNumber") ||
    `TKT-${String(ticket._id || ticketId).slice(-6).toUpperCase()}`;

  const subject =
    getValue(ticket, "subject", "Subject") || "Untitled ticket";

  const description = getValue(
    ticket,
    "description",
    "Description"
  );

  const statusStyle = {
    open: "bg-sky-400/15 text-sky-100 ring-sky-300/20",
    pending: "bg-amber-400/15 text-amber-100 ring-amber-300/20",
    "in progress": "bg-violet-400/15 text-violet-100 ring-violet-300/20",
    resolved: "bg-emerald-400/15 text-emerald-100 ring-emerald-300/20",
    closed: "bg-slate-400/15 text-slate-200 ring-white/15",
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Breadcrumb navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            <Link
              to="/user/dashboard"
              className="text-slate-500 transition hover:text-indigo-600"
            >
              Dashboard
            </Link>

            <ChevronRight size={15} className="text-slate-300" />

            <Link
              to="/user/my-tickets"
              className="text-slate-500 transition hover:text-indigo-600"
            >
              My Tickets
            </Link>

            <ChevronRight size={15} className="text-slate-300" />

            <span className="font-semibold text-slate-800">
              {ticketNumber}
            </span>
          </nav>

          <Link
            to="/user/my-tickets"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            All Tickets
          </Link>
        </div>

        {/* Ticket header */}
        <section className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 text-white shadow-md">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <Ticket size={24} />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1.5 font-mono text-xs font-bold">
                    {ticketNumber}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${
                      statusStyle[status] ||
                      "bg-white/10 text-white ring-white/20"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl">
                  {subject}
                </h1>

                <p className="mt-1.5 text-sm text-indigo-100/80">
                  View your request and communicate with support.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              disabled={isFetching}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-60 sm:self-center"
            >
              <RefreshCw
                size={15}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        {isError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>
              Ticket refresh failed. Showing previously loaded information.
            </p>
          </div>
        )}

        {/* Details + conversation */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)]">
          <aside className="min-w-0">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Ticket information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Status, priority and assignment details
              </p>
            </div>

            <TicketInfo ticket={ticket} ticketId={ticketId} />
          </aside>

          {/* Conversation panel */}
          <section className="flex min-h-[480px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
         

            <div className="min-h-0 flex-1">
              <TicketChat
                ticketId={ticketId}
                initialMessage={description}
              />
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
              <ChatInput
                ticketId={ticketId}
                disabled={isClosed}
                onMessageSent={handleRetry}
              />
            </div>
          </section>
        </div>

        <footer className="py-6 text-center">
          <Link
            to="/user/my-tickets"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            <ArrowLeft size={15} />
            Return to My Tickets
          </Link>
        </footer>
      </div>
    </main>
  );
}
