
import { useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

const toastStyles = {
  success: {
    icon: CheckCircle2,
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    progress: "bg-emerald-400",
    title: "Success",
  },
  error: {
    icon: XCircle,
    border: "border-red-500/30",
    iconColor: "text-red-400",
    progress: "bg-red-400",
    title: "Error",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    progress: "bg-amber-400",
    title: "Warning",
  },
  info: {
    icon: Info,
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    progress: "bg-blue-400",
    title: "Information",
  },
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast?.id) return;

    const timer = setTimeout(() => {
      onClose?.(toast.id);
    }, toast.duration ?? 3500);

    return () => clearTimeout(timer);
  }, [toast?.id, toast?.duration, onClose]);

  if (!toast) return null;

  const style = toastStyles[toast.type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border ${style.border} bg-[#171717] p-4 text-white shadow-2xl shadow-black/40 animate-in slide-in-from-right-5 fade-in duration-200`}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={23}
          className={`mt-0.5 shrink-0 ${style.iconColor}`}
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">
            {toast.title || style.title}
          </h3>

          <p className="mt-1 break-words text-sm leading-5 text-gray-300">
            {toast.message}
          </p>

          {toast.action && (
            <button
              type="button"
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-semibold underline underline-offset-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onClose?.(toast.id)}
          aria-label="Close notification"
          className="shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-white/5">
        <div
          className={`h-full w-full ${style.progress}`}
          style={{
            animation: `toast-progress ${toast.duration ?? 3500}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}
