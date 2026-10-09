import { useToast } from "../context/ToastContext";

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => removeToast(toast.id)}>
            x
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
