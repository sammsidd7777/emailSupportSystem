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

/* display-only: progress steps shown in the header */
const progressSteps = ["Received", "In progress", "Resolved"];

const getStepIndex = (status) => {
  if (["resolved", "closed"].includes(status)) return 2;
  if (status === "in progress") return 1;
  return 0;
};

const goldButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 text-sm font-bold text-neutral-950 shadow-[0_10px_30px_rgba(217,160,40,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60";

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200/50 bg-white p-8 text-center shadow-[0_8px_30px_rgba(120,85,10,0.06)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <LoaderCircle
            size={30}
            className="animate-spin text-amber-600"
          />
        </div>
        <h2 className="mt-4 font-semibold text-slate-900">
          Opening your ticket
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Getting the latest details...
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={28} />
        </div>

        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          We couldn't open this ticket
        </h2>

        <p className="mt-2 break-words text-sm leading-6 text-slate-500">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className={`${goldButton} mt-5 px-5 py-3`}
        >
          <RefreshCw size={16} />
          Retry
        </button>

        <div>
          <Link
            to="/user/my-tickets"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-amber-700"
          >
            <ArrowLeft size={15} />
            Back to my tickets
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
    open: "bg-sky-400/15 text-sky-100 ring-sky-300/25",
    pending: "bg-amber-400/15 text-amber-100 ring-amber-300/25",
    "in progress": "bg-violet-400/15 text-violet-100 ring-violet-300/25",
    resolved: "bg-emerald-400/15 text-emerald-100 ring-emerald-300/25",
    closed: "bg-slate-400/15 text-slate-200 ring-white/15",
  };

  const stepIndex = getStepIndex(status);

  return (
    <main className="w-full min-w-0">
      <div className="mx-auto w-full max-w-[1600px] pb-4">
        {/* Breadcrumb navigation */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            <Link
              to="/user/dashboard"
              className="text-slate-500 transition hover:text-amber-700"
            >
              Dashboard
            </Link>

            <ChevronRight size={15} className="text-slate-300" />

            <Link
              to="/user/my-tickets"
              className="text-slate-500 transition hover:text-amber-700"
            >
              My tickets
            </Link>

            <ChevronRight size={15} className="text-slate-300" />

            <span className="font-semibold text-slate-800">
              {ticketNumber}
            </span>
          </nav>

          <Link
            to="/user/my-tickets"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
          >
            <ArrowLeft size={16} />
            All tickets
          </Link>
        </div>

        {/* Ticket header */}
        <section className="relative mb-6 overflow-hidden rounded-[24px] border border-amber-200/15 bg-[#0a0907] text-white shadow-[0_22px_50px_rgba(20,15,5,0.3),inset_0_1px_0_rgba(253,234,168,0.12)]">
          <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-amber-600/25 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-28 right-10 h-64 w-64 rounded-full bg-yellow-500/15 blur-[100px]" />

          <div className="relative flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-start sm:p-7">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/10 text-amber-300">
                <Ticket size={24} />
              </div>

              <div className="min-w-0">
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1.5 font-mono text-xs font-bold text-amber-100">
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

                <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                  {subject}
                </h1>

                <p className="mt-2 text-sm text-white/55">
                  Follow progress and chat with our support team below.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              disabled={isFetching}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 backdrop-blur transition hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Progress */}
          <div className="relative border-t border-white/10 px-5 py-4 sm:px-7">
            <ol className="flex items-center">
              {progressSteps.map((step, index) => {
                const done = index <= stepIndex;
                const last = index === progressSteps.length - 1;

                return (
                  <li
                    key={step}
                    className={`flex items-center ${last ? "" : "flex-1"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          done
                            ? "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-neutral-950"
                            : "border border-white/20 text-white/40"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span
                        className={`text-xs font-medium sm:text-sm ${
                          done ? "text-amber-100" : "text-white/40"
                        }`}
                      >
                        {step}
                      </span>
                    </div>

                    {!last && (
                      <span
                        className={`mx-3 h-px flex-1 sm:mx-4 ${
                          index < stepIndex
                            ? "bg-amber-400/70"
                            : "bg-white/15"
                        }`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {isError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>
              We couldn't refresh this ticket. You're seeing the last
              information we loaded.
            </p>
          </div>
        )}

        {/* Details + conversation */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)]">
          <aside className="min-w-0">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                About this ticket
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Status, priority and who's helping you
              </p>
            </div>

            <TicketInfo ticket={ticket} ticketId={ticketId} />
          </aside>

          {/* Conversation panel */}
          <section className="flex min-h-[520px] min-w-0 flex-col overflow-hidden rounded-2xl border border-amber-200/50 bg-white shadow-[0_8px_30px_rgba(120,85,10,0.06)]">
           

            <div className="min-h-0 flex-1">
              <TicketChat
                ticketId={ticketId}
                initialMessage={description}
              />
            </div>

            <div className="shrink-0 border-t border-amber-100 bg-white p-3 sm:p-4">
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 transition hover:text-amber-900"
          >
            <ArrowLeft size={15} />
            Back to my tickets
          </Link>
        </footer>
      </div>
    </main>
  );
}