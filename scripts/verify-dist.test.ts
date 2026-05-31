/** @fileoverview Unit tests for release verification platform selection. */
import { describe, it, expect } from "vitest";
// @ts-ignore - CJS import in TS file
import { getTargets } from "./verify-dist.cjs";

describe("verify-dist platform selection", () => {
  it("selects Windows x64 when running on win32 with no args", () => {
    const targets = getTargets("win32", []);
    expect(targets.checkWin).toBe(true);
    expect(targets.checkMac).toBe(false);
    expect(targets.targetArches).toEqual(["x64"]);
  });

  it("selects macOS x64/arm64 when running on darwin with no args", () => {
    const targets = getTargets("darwin", []);
    expect(targets.checkWin).toBe(false);
    expect(targets.checkMac).toBe(true);
    expect(targets.targetArches).toEqual(["x64", "arm64"]);
  });

  it("selects both when --all is passed", () => {
    const targets = getTargets("linux", ["--all"]);
    expect(targets.checkWin).toBe(true);
    expect(targets.checkMac).toBe(true);
    expect(targets.targetArches).toEqual(["x64", "arm64"]);
  });

  it("respects explicit --win and --mac flags", () => {
    const targets = getTargets("linux", ["--win", "--mac"]);
    expect(targets.checkWin).toBe(true);
    expect(targets.checkMac).toBe(true);
  });

  it("respects explicit --arch flag", () => {
    const targets = getTargets("darwin", ["--arch", "arm64"]);
    expect(targets.targetArches).toEqual(["arm64"]);
  });

  it("prevents Linux from defaulting to Windows (regression test)", () => {
    const targets = getTargets("linux", []);
    expect(targets.checkWin).toBe(false);
    expect(targets.checkMac).toBe(false);
  });
});
