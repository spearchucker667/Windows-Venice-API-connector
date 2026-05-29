import React, { useEffect, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface ConfirmModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Primary question shown in the modal heading. */
  message: string;
  /** Optional longer explanation rendered below the heading. */
  detail?: string;
  /** Label for the confirm action button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Label for the cancel action button. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Tone for the confirm button: "danger" renders a red button. Defaults to "danger". */
  confirmTone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  message,
  detail,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<Element | null>(null);

  const prevOverflowRef = useRef<string>("");

  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement;
      prevOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // Default focus on the safe/cancel action.
      setTimeout(() => cancelRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = prevOverflowRef.current;
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus();
      }
      returnFocusRef.current = null;
    }
    return () => {
      document.body.style.overflow = prevOverflowRef.current;
    };
  }, [open]);

  useFocusTrap(modalRef, open, onCancel);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-overlay/60 p-6 backdrop-blur-2xl animate-[fadeIn_0.3s_ease]"
      onClick={onCancel}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-border/50 bg-surface/90 p-6 shadow-[0_24px_64px_var(--overlay),0_0_0_1px_var(--glow)] backdrop-blur-xl animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby={detail ? "confirm-modal-detail" : undefined}
      >
        <h2 id="confirm-modal-title" className="text-lg font-display font-semibold text-text-primary mb-2">
          {message}
        </h2>
        {detail && (
          <p id="confirm-modal-detail" className="text-sm text-text-secondary mb-6 leading-relaxed">
            {detail}
          </p>
        )}
        <div className="flex items-center justify-end gap-3">
          <button ref={cancelRef} className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`btn ${confirmTone}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
