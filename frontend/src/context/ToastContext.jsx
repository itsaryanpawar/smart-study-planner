import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const addToast = (message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 3200);
  };

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
    }),
    [toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}
