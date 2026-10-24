import { useState } from "react";
import { Send, LoaderCircle } from "lucide-react";
import { useUserReplyToTicketMutation } from "../../../services/RTK/userApi";

export default function ChatInput({
  ticketId,
  onMessageSent,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const [sendReply, { isLoading }] = useUserReplyToTicketMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || !ticketId || isLoading || disabled) return;

    try {
      await sendReply({ ticketId, message: message.trim() }).unwrap();
      setMessage("");
      await onMessageSent?.();
    } catch (err) {
      console.error(err?.data?.message || "Your message could not be sent.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 rounded-2xl border p-2 transition ${
        disabled
          ? "border-dashed border-slate-300 bg-slate-100/70"
          : "border-amber-200/70 bg-amber-50/40 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20"
      }`}
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          disabled
            ? "This ticket is closed, so replies are turned off."
            : "Write a reply to support..."
        }
        disabled={disabled || isLoading || !ticketId}
        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
      />

      <button
        type="submit"
        disabled={!message.trim() || !ticketId || isLoading || disabled}
        className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 px-4 text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
      >
        {isLoading ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        <span className="hidden sm:inline">
          {isLoading ? "Sending..." : "Send"}
        </span>
      </button>
    </form>
  );
}