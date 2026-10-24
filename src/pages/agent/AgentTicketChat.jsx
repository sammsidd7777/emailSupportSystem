
import {
  MessageSquare,
  Send,
  UserRound,
  Headphones,
  AlertCircle,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSender(message) {
  const sender =
    message?.senderId ||
    message?.sender ||
    message?.userId ||
    message?.author ||
    {};

  const role = String(
    message?.senderRole ||
      message?.role ||
      sender?.role ||
      ""
  ).toLowerCase();

  const isAgent = [
    "supportagent",
    "support_agent",
    "agent",
    "admin",
  ].includes(role);

  return {
    isAgent,
    name:
      message?.senderName ||
      sender?.name ||
      sender?.fullName ||
      (isAgent ? "Support team" : "Customer"),
  };
}

function getMessageText(message) {
  if (typeof message === "string") return message;

  return (
    message?.message ??
    message?.text ??
    message?.content ??
    message?.body ??
    ""
  );
}

export default function AgentTicketChat({
  messages = [],
  ticket,
  message,
  setMessage,
  onReply,
  sending,
  isClosed,
}) {
  const conversation = Array.isArray(messages) ? messages : [];

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Chat header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessageSquare size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Conversation
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {conversation.length}{" "}
              {conversation.length === 1 ? "message" : "messages"}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {isClosed ? "Closed" : "Active"}
        </span>
      </div>

      {/* Scrollable message history */}
      <div className="h-[420px] overflow-y-auto overscroll-contain bg-slate-50/70 p-4 sm:h-[520px] sm:p-6">
        {conversation.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <MessageSquare size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-700">
              No messages yet
            </h3>

            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Messages will appear here when the customer or support team replies.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {conversation.map((item, index) => {
              const sender = getSender(item);
              const text = getMessageText(item);
              const key =
                item?._id ||
                item?.id ||
                `${item?.createdAt || "message"}-${index}`;

              return (
                <div
                  key={key}
                  className={`flex gap-3 ${
                    sender.isAgent ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      sender.isAgent
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {sender.isAgent ? (
                      <Headphones size={17} />
                    ) : (
                      <UserRound size={17} />
                    )}
                  </div>

                  <div
                    className={`flex min-w-0 max-w-[85%] flex-col ${
                      sender.isAgent ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {sender.name}
                      </span>

                      {item?.createdAt && (
                        <span className="text-[11px] text-slate-400">
                          {formatDate(item.createdAt)}
                        </span>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        sender.isAgent
                          ? "rounded-tr-sm bg-blue-600 text-white"
                          : "rounded-tl-sm border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {text || "No message content"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply composer */}
      <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
        {isClosed ? (
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>This ticket is closed or resolved. Replies are disabled.</p>
          </div>
        ) : (
          <form onSubmit={onReply}>
            <label
              htmlFor="agent-reply"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Write a reply
            </label>

            <textarea
              id="agent-reply"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type your message to the customer..."
              rows={4}
              maxLength={10000}
              disabled={sending}
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Keep your reply clear and professional.
              </p>

              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send reply"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
