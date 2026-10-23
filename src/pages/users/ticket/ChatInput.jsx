
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
      console.error(err?.data?.message || "Message send nahi hua.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={disabled ? "Ticket is closed" : "Type a message..."}
        disabled={disabled || isLoading || !ticketId}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400"
      />

      <button
        type="submit"
        disabled={!message.trim() || !ticketId || isLoading || disabled}
        className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        Send
      </button>
    </form>
  );
}
