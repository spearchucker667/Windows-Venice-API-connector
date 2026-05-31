import React, { useEffect } from "react";
import { ModuleProps, ToastMessage, AppDispatch } from "../types/app";

export function ToastHost({ state, dispatch }: ModuleProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      {state.toasts?.map((toast) => (
        <ToastItem key={toast.id} toast={toast} dispatch={dispatch} />
      ))}
    </div>
  );
}

const toastStyles: Record<string, string> = {
  error: "border-danger/30 bg-danger/20 text-danger",
  success: "border-success/30 bg-success/20 text-success",
  warn: "border-warning/30 bg-warning/20 text-warning",
  info: "border-border/50 bg-surface-elevated/80 text-text-primary shadow-sm",
};

function ToastItem({ toast, dispatch }: { toast: ToastMessage; dispatch: AppDispatch }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", id: toast.id });
    }, toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  const live = toast.type === "error" ? "assertive" : "polite";
  const role = toast.type === "error" ? "alert" : "status";
  const toneClass = toastStyles[toast.type] || toastStyles.info;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-xl animate-[slideUp_0.3s_ease] ${toneClass}`}
      role={role}
      aria-live={live}
    >
      {toast.message}
    </div>
  );
}
