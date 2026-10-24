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
          "Your reply couldn't be sent. Please try again."
      );
    }
  };

  if (!ticketId) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
        <AlertCircle className="h-5 w-5 shrink-0" />
        The ticket ID is missing.
      </div>
    );
  }

  return (
    <section className="flex h-[min(680px,75vh)] min-h-[420px] w-full min-w-0 flex-col overflow-hidden bg-white">
      {/* Chat header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-50/80 to-white px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-700">
            <MessagesSquare className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-slate-900">
              Conversation
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                Support thread
              </span>

              <span className="text-slate-300">•</span>

              <span>
                {messages.length}{" "}
                {messages.length === 1 ? "reply" : "replies"}
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
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
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
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#faf7f0] px-3 py-5 sm:px-6 sm:py-6"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#e5c97a transparent",
        }}
      >
        {isLoading ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-amber-200/70">
              <RefreshCw className="h-5 w-5 animate-spin text-amber-600" />
            </div>
            <p className="font-medium">Loading conversation...</p>
          </div>
        ) : isError ? (
          <div className="mx-auto flex min-h-60 max-w-sm flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle className="h-6 w-6" />
            </div>

            <p className="font-semibold text-slate-800">
              We couldn't load the messages
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error?.data?.message || "Something went wrong while loading messages."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/20 transition hover:brightness-110"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            {/* Original ticket description */}
            {ticketDescription && (
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700 shadow-sm">
                  <UserRound className="h-4 w-4" />
                </div>

                <div className="min-w-0 max-w-[calc(100%-44px)] flex-1 sm:max-w-[85%]">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      You
                    </span>
                    <span className="rounded-full border border-amber-300/60 bg-amber-100/70 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                      Original request
                    </span>
                  </div>

                  <div className="rounded-2xl rounded-tl-md border border-dashed border-amber-300/70 bg-white px-4 py-3.5 shadow-sm">
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
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700 shadow-sm">
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
                      <span className="text-xs font-semibold text-slate-700">
                        {isCustomer
                          ? "You"
                          : isAdmin
                            ? "Admin"
                            : "Support agent"}
                      </span>

                      {email && (
                        <span className="max-w-full truncate text-[11px] text-slate-400">
                          {email}
                        </span>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3.5 ${
                        isCustomer
                          ? "rounded-tl-md border border-amber-200/60 bg-white text-slate-700 shadow-sm"
                          : "rounded-tr-md border border-amber-200/15 bg-[#0a0907] text-white shadow-[0_10px_24px_rgba(20,15,5,0.25),inset_0_1px_0_rgba(253,234,168,0.12)]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {text}
                      </p>

                      {date && (
                        <div
                          className={`mt-3 flex items-center gap-1.5 text-[10px] ${
                            isCustomer
                              ? "justify-start text-slate-400"
                              : "justify-end text-amber-100/50"
                          }`}
                        >
                          <Clock3 className="h-3 w-3" />
                          <span>{date}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isCustomer && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/50 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/20">
                      <Headset className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {!ticketDescription && messages.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-200/70">
                  <MessageCircle className="h-7 w-7" />
                </div>

                <h3 className="font-semibold text-slate-800">
                  No messages yet
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Replies from you and our support team will appear here.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Optional reply composer */}
      {!readOnly && onSendReply && (
        <footer className="shrink-0 border-t border-amber-100 bg-white p-3 sm:p-5">
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

            <div className="flex items-end gap-2 rounded-2xl border border-amber-200/70 bg-amber-50/40 p-2 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20">
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
                placeholder="Write your reply..."
                rows={2}
                maxLength={5000}
                className="max-h-32 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!reply.trim() || isLoading}
                className="mb-0.5 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 px-4 text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <p className="text-[11px] text-slate-400">
                Enter to send · Shift + Enter for a new line
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