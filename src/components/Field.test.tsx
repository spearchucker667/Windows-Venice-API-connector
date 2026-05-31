// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Field } from "./Field";

describe("Field label association", () => {
  afterEach(() => {
    cleanup();
  });

  it("associates label with a single input child (LOW-001)", () => {
    render(
      <Field label="Username">
        <input placeholder="Enter name" />
      </Field>
    );

    const label = screen.getByText("Username");
    const input = screen.getByPlaceholderText("Enter name");

    expect(label).toHaveAttribute("for", input.id);
    expect(input).toHaveAttribute("id");
  });

  it("uses aria-labelledby for multiple children (LOW-001 fallback)", () => {
    render(
      <Field label="Actions">
        <button>Button 1</button>
        <button>Button 2</button>
      </Field>
    );

    const label = screen.getByText("Actions");
    const group = screen.getByRole("group");

    expect(group).toHaveAttribute("aria-labelledby", label.id);
    expect(label).toHaveAttribute("id");
    // Should NOT have htmlFor because there's no single target
    expect(label).not.toHaveAttribute("for");
  });

  it("uses aria-labelledby for React.Fragment (LOW-001 fallback)", () => {
    render(
      <Field label="Frag">
        <>
          <input placeholder="In fragment" />
        </>
      </Field>
    );

    const label = screen.getByText("Frag");
    const group = screen.getByRole("group");

    expect(group).toHaveAttribute("aria-labelledby", label.id);
  });
});
