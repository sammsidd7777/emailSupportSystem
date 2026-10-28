
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
    color: "border-emerald-200 bg-white text-emerald-700",
    iconColor: "text-emerald-600",
    progress: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    color: "border-red-200 bg-white text-red-700",
    iconColor: "text-red-600",
    progress: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    color: "border-amber-200 bg-white text-amber-700",
    iconColor: "text-amber-600",
    progress: "bg-amber-500",
  },
  info: {
    icon: Info,
    color: "border-blue-200 bg-white text-blue-700",
    iconColor: "text-blue-600",
    progress: "bg-blue-500",
  },
};

export default function Toast({
  toast,
  onClose,
  duration = 3500,
}) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose?.(toast.id);
    }, toast.duration ?? duration);

    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const style = toastStyles[toast.type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border p-4 shadow-xl ${style.color}`}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={23}
          className={`mt-0.5 shrink-0 ${style.iconColor}`}
        />

        <div className="min-w-0 flex-1">
          {toast.title && (
            <h3 className="text-sm font-bold">
              {toast.title}
            </h3>
          )}

          <p className="mt-1 break-words text-sm text-slate-600">
            {toast.message}
          </p>

          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-bold underline underline-offset-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onClose?.(toast.id)}
          aria-label="Close notification"
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={17} />
        </button>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-full ${style.progress}`}
      />
    </div>
  );
}
