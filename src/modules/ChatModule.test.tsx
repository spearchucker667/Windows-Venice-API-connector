// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { ChatModule } from "./ChatModule";
import { initialState } from "../state/appReducer";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("../services/veniceClient", () => ({
  veniceFetch: vi.fn(),
  veniceStreamChat: vi.fn(),
}));

vi.mock("../services/storageService", () => ({
  default: {
    saveItem: vi.fn().mockResolvedValue({ id: "saved", timestamp: 1 }),
    getItems: vi.fn().mockResolvedValue([]),
  },
}));

// ModelRefreshButton calls refreshModels internally; stub it out.
vi.mock("../services/modelService", () => ({ refreshModels: vi.fn() }));

// ---------------------------------------------------------------------------
// jsdom stubs
// ---------------------------------------------------------------------------

// jsdom does not implement scrollIntoView; provide a no-op so the useEffect
// inside ChatModule does not throw.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { veniceFetch, veniceStreamChat } from "../services/veniceClient";

const mockDispatch = vi.fn();

function renderChat(stateOverride: object = {}) {
  const state = { ...initialState, ...stateOverride };
  return render(<ChatModule state={state} dispatch={mockDispatch} />);
}

// Send button selector: exact text "Send" as the primary action button.
const sendBtnSelector = { name: /^send$/i };
// The prompt textarea has aria-label "User prompt".
const promptSelector = { name: /^user prompt$/i };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ChatModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the prompt textarea and send button", () => {
    renderChat();
    expect(screen.getByRole("textbox", promptSelector)).toBeInTheDocument();
    expect(screen.getByRole("button", sendBtnSelector)).toBeInTheDocument();
  });

  it("does not call API when the prompt is empty and send is clicked", async () => {
    renderChat();
    await userEvent.click(screen.getByRole("button", sendBtnSelector));
    expect(veniceFetch).not.toHaveBeenCalled();
    expect(veniceStreamChat).not.toHaveBeenCalled();
    // Validation message should appear.
    expect(screen.getByText(/please enter a prompt/i)).toBeInTheDocument();
  });

  it("calls veniceFetch for non-streaming send and appends assistant reply", async () => {
    (veniceFetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { choices: [{ message: { content: "Hello from Venice!" } }] },
    });

    renderChat();

    await userEvent.type(screen.getByRole("textbox", promptSelector), "What is the weather?");
    await userEvent.click(screen.getByRole("button", sendBtnSelector));

    await waitFor(() => {
      expect(veniceFetch).toHaveBeenCalledWith(
        "/chat/completions",
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Hello from Venice!")).toBeInTheDocument();
    });
  });

  it("calls veniceStreamChat when streaming is enabled", async () => {
    (veniceStreamChat as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    renderChat();

    // "Model & Settings" section is collapsed by default — expand it to access the checkboxes.
    await userEvent.click(screen.getByRole("button", { name: /model.*settings/i }));

    const streamCheckbox = screen.getByRole("checkbox", { name: /stream response/i });
    await userEvent.click(streamCheckbox);

    await userEvent.type(screen.getByRole("textbox", promptSelector), "Tell me a joke");
    await userEvent.click(screen.getByRole("button", sendBtnSelector));

    await waitFor(() => {
      expect(veniceStreamChat).toHaveBeenCalled();
    });
    expect(veniceFetch).not.toHaveBeenCalled();
  });

  it("shows an error message when veniceFetch rejects", async () => {
    (veniceFetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("503 Service Unavailable")
    );

    renderChat();

    await userEvent.type(screen.getByRole("textbox", promptSelector), "Trigger an error");
    await userEvent.click(screen.getByRole("button", sendBtnSelector));

    await waitFor(() => {
      expect(screen.getByText(/503 service unavailable/i)).toBeInTheDocument();
    });
  });
});
