
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Send,
  RefreshCw,
  MessageCircle,
  UserRound,
  Headset,
  AlertCircle,
  Clock3,
  MessagesSquare,
} from "lucide-react";

import { useGetMessagesByTicketIdQuery } from "../../../services/RTK/messageApi";

const getConversationData = (result) => {
  const data =
    result?.message ??
    result?.messages ??
    result?.data?.message ??
    result?.data?.messages ??
    result?.data?.data ??
    result?.data ??
    result;

  if (Array.isArray(data)) return data[0] ?? null;

  return data && typeof data === "object" ? data : null;
};

const getMessageText = (message) =>
  message?.Body ??
  message?.body ??
  message?.message ??
  message?.text ??
  "";

const getSenderRole = (message) =>
  String(
    message?.SenderRole ??
      message?.senderRole ??
      message?.role ??
      ""
  )
    .trim()
    .toLowerCase();

const getSenderEmail = (message) =>
  message?.SenderEmail ??
  message?.senderEmail ??
  message?.email ??
  "";

const getMessageDate = (message) => {
  const date = message?.createdAt ?? message?.CreatedAt;

  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TicketChat({
  ticketId: ticketIdProp,
  initialMessage = "",
  onSendReply,
  readOnly = false,
}) {
  const params = useParams();
  const ticketId = ticketIdProp ?? params.ticketId ?? params.id;

  const [reply, setReply] = useState("");
  const [sendError, setSendError] = useState("");

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const wasAtBottomRef = useRef(true);

  const {
    data: messageResult,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMessagesByTicketIdQuery(ticketId, {
    skip: !ticketId,
  });

  const conversation = useMemo(
    () => getConversationData(messageResult),
    [messageResult]
  );

  const messages = useMemo(() => {
    const embeddedMessages =
      conversation?.Messages ?? conversation?.messages;

    if (!Array.isArray(embeddedMessages)) return [];

    return embeddedMessages
      .filter((message) => getMessageText(message).trim().length > 0)
      .map((message, index) => ({
        ...message,
        _chatKey:
          message?._id ??
          `${message?.createdAt ?? message?.CreatedAt ?? "message"}-${index}`,
      }));
  }, [conversation]);

  const ticketDescription =
    initialMessage ||
    conversation?.Body ||
    conversation?.body ||
    conversation?.Description ||
    conversation?.description ||
    "";

  useEffect(() => {
    setSendError("");
    setReply("");
  }, [ticketId]);

  // Scroll only the message area, not the whole page.
  useEffect(() => {
    if (!wasAtBottomRef.current) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, isLoading]);

  const handleScroll = () => {
    const element = messagesContainerRef.current;
    if (!element) return;

    wasAtBottomRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 100;
  };

  const handleSend = async (event) => {
    event.preventDefault();

    const text = reply.trim();

    if (!text || !ticketId || readOnly || !onSendReply) return;

    setSendError("");

    try {
      await onSendReply({
        ticketId,
        message: text,
      });

      setReply("");
      wasAtBottomRef.current = true;
      await refetch();
    } catch (err) {
      setSendError(
        err?.data?.message ||
          err?.message ||
          "Reply send nahi ho paya. Please try again."
      );
    }
  };

  if (!ticketId) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
        <AlertCircle className="h-5 w-5 shrink-0" />
        Ticket ID missing hai.
      </div>
    );
  }

  return (
    <section className="flex h-[min(680px,75vh)] min-h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Chat header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <MessagesSquare className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold tracking-tight text-slate-900">
              Ticket Conversation
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Support thread
              </span>

              <span className="text-slate-300">•</span>

              <span>
                {messages.length}{" "}
                {messages.length === 1 ? "message" : "messages"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh conversation"
          aria-label="Refresh conversation"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">
            {isFetching ? "Refreshing" : "Refresh"}
          </span>
        </button>
      </header>

      {/* Scrollable message area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 px-3 py-5 sm:px-6 sm:py-6"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",
        }}
      >
        {isLoading ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
            </div>
            <p className="font-medium">Loading conversation...</p>
          </div>
        ) : isError ? (
          <div className="mx-auto flex min-h-60 max-w-sm flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle className="h-6 w-6" />
            </div>

            <p className="font-semibold text-slate-800">
              Couldn't load messages
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error?.data?.message || "Messages load nahi ho paye."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            {/* Original ticket description */}
            {ticketDescription && (
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                  <UserRound className="h-4 w-4" />
                </div>

                <div className="min-w-0 max-w-[calc(100%-44px)] flex-1 sm:max-w-[85%]">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Original Ticket
                    </span>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Initial message
                    </span>
                  </div>

                  <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {ticketDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation messages */}
            {messages.map((message) => {
              const role = getSenderRole(message);
              const isCustomer = ["user", "customer"].includes(role);
              const isAdmin = role === "admin";
              const text = getMessageText(message);
              const email = getSenderEmail(message);
              const date = getMessageDate(message);

              return (
                <div
                  key={message._chatKey}
                  className={`flex min-w-0 items-start gap-2.5 sm:gap-3 ${
                    isCustomer ? "justify-start" : "justify-end"
                  }`}
                >
                  {isCustomer && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
                      <UserRound className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`min-w-0 max-w-[calc(100%-44px)] sm:max-w-[78%] ${
                      isCustomer ? "" : "items-end"
                    }`}
                  >
                    <div
                      className={`mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 ${
                        isCustomer ? "" : "justify-end"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-700">
                        {isCustomer
                          ? "Customer"
                          : isAdmin
                            ? "Admin"
                            : "Support Agent"}
                      </span>

                      {email && (
                        <span className="max-w-full truncate text-[11px] text-slate-400">
                          {email}
                        </span>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3.5 shadow-sm ${
                        isCustomer
                          ? "rounded-tl-md border border-slate-200 bg-white text-slate-700"
                          : "rounded-tr-md bg-indigo-600 text-white shadow-indigo-900/10"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {text}
                      </p>

                      {date && (
                        <div
                          className={`mt-3 flex items-center gap-1.5 text-[10px] ${
                            isCustomer
                              ? "text-slate-400"
                              : "text-indigo-100"
                          } ${
                            isCustomer ? "justify-start" : "justify-end"
                          }`}
                        >
                          <Clock3 className="h-3 w-3" />
                          <span>{date}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isCustomer && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                      <Headset className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {!ticketDescription && messages.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-500 shadow-sm ring-1 ring-slate-200">
                  <MessageCircle className="h-7 w-7" />
                </div>

                <h3 className="font-semibold text-slate-800">
                  No messages yet
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Conversation messages yahan show honge jab customer ya
                  support team reply karegi.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Optional reply composer */}
      {!readOnly && onSendReply && (
        <footer className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-5">
          <form
            onSubmit={handleSend}
            className="mx-auto w-full max-w-4xl"
          >
            {sendError && (
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{sendError}</p>
              </div>
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Write your reply... (Shift + Enter for new line)"
                rows={2}
                maxLength={5000}
                className="max-h-32 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!reply.trim() || isLoading}
                className="mb-0.5 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <p className="text-[11px] text-slate-400">
                Enter to send · Shift + Enter for new line
              </p>
              <span className="shrink-0 text-[11px] text-slate-400">
                {reply.length}/5000
              </span>
            </div>
          </form>
        </footer>
      )}
    </section>
  );
}
