
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import Toast from "./Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback(
    (message, type = "success", options = {}) => {
      const id = `${Date.now()}-${Math.random()}`;

      const toast = {
        id,
        message,
        type,
        title: options.title,
        duration: options.duration ?? 3500,
        action: options.action,
      };

      setToasts((current) => [...current, toast]);

      return id;
    },
    []
  );

  const toast = useMemo(
    () => ({
      show: showToast,
      success: (message, options) =>
        showToast(message, "success", options),
      error: (message, options) =>
        showToast(message, "error", options),
      warning: (message, options) =>
        showToast(message, "warning", options),
      info: (message, options) =>
        showToast(message, "info", options),
      dismiss: removeToast,
    }),
    [showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
       <div className="pointer-events-none fixed right-4 top-4 z-[99999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
  {toasts.map((item) => (
    <Toast
      key={item.id}
      toast={item}
      onClose={removeToast}
    />
  ))}
</div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
}
