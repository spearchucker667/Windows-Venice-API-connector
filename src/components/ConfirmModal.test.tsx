// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal Accessibility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.style.overflow = "";
  });

  it("focuses the cancel button by default (LOW-007)", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    
    render(
      <ConfirmModal
        open={true}
        message="Test Message"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    // Wait for the focus timeout
    vi.advanceTimersByTime(100);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    expect(document.activeElement).toBe(cancelBtn);
  });

  it("restores body overflow on close (LOW-002)", () => {
    document.body.style.overflow = "scroll";
    const { rerender } = render(
      <ConfirmModal
        open={true}
        message="Test"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <ConfirmModal
        open={false}
        message="Test"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("has correct ARIA attributes for the dialog", () => {
    render(
      <ConfirmModal
        open={true}
        message="Delete Item?"
        detail="This cannot be undone."
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "confirm-modal-title");
    expect(dialog).toHaveAttribute("aria-describedby", "confirm-modal-detail");
    
    expect(screen.getByText("Delete Item?").id).toBe("confirm-modal-title");
    expect(screen.getByText("This cannot be undone.").id).toBe("confirm-modal-detail");
  });
  
  it("ensures modal root has tabIndex -1 for fallback focus (LOW-006)", () => {
    render(
      <ConfirmModal
        open={true}
        message="No buttons"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("tabIndex", "-1");
  });
});
