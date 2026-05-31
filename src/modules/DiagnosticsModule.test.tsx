import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiagnosticsModule } from "./DiagnosticsModule";
import type { AppState, AppDispatch } from "../types/app";

// Mock download utils
vi.mock("../utils/download", () => ({
  copyText: vi.fn(),
}));
import { copyText } from "../utils/download";

const mockDispatch = vi.fn() as unknown as AppDispatch;

const mockState: AppState = {
  activeTab: "diagnostics",
  diagnostics: null,
  diagnosticsLog: [],
  // stub other fields as needed
} as unknown as AppState;

describe("DiagnosticsModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("copies diagnostics when clipboard is available", async () => {
    // Stub clipboard API as available
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
    vi.mocked(copyText).mockResolvedValue(undefined);

    render(
      <DiagnosticsModule
        state={mockState}
        dispatch={mockDispatch}
        apiKeyConfigured={true}
      />
    );

    const copyBtn = screen.getByRole("button", { name: /copy diagnostics/i });
    await userEvent.click(copyBtn);

    await waitFor(() => {
      expect(copyText).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "ADD_TOAST",
          toast: expect.objectContaining({ type: "success" })
        })
      );
      expect(screen.queryByRole("textbox")).toBeNull();
    });
  });

  it("shows fallback textarea when clipboard is unavailable", async () => {
    // Stub clipboard API to fail
    Object.assign(navigator, {
      clipboard: undefined
    });
    vi.mocked(copyText).mockRejectedValue(new Error("Clipboard API unavailable"));

    render(
      <DiagnosticsModule
        state={mockState}
        dispatch={mockDispatch}
        apiKeyConfigured={true}
      />
    );

    const copyBtn = screen.getByRole("button", { name: /copy diagnostics/i });
    await userEvent.click(copyBtn);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "ADD_TOAST",
          toast: expect.objectContaining({ type: "error" })
        })
      );
      // The fallback text area should appear
      const textarea = screen.getByDisplayValue(/\{/);
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe("TEXTAREA");
    });
  });
});
