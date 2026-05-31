/** @fileoverview Unit tests for the safety guard verification script. */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
// @ts-expect-error - CJS import in TS file
import { runEnforcementChecks, scanForViolations, verifySafetyGuard } from "./verify-safety-guard.cjs";

describe("verify-safety-guard", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vfg-safety-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("runEnforcementChecks", () => {
    it("passes when all enforcement files contain required guards", () => {
      const srcDir = path.join(tmpDir, "src", "services");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(
        path.join(srcDir, "veniceClient.ts"),
        "function a() { assessChildExploitationSafety(); } function b() { assessChildExploitationSafety(); }"
      );

      const electronDir = path.join(tmpDir, "electron", "ipc");
      fs.mkdirSync(electronDir, { recursive: true });
      fs.writeFileSync(
        path.join(electronDir, "handlers.ts"),
        '"venice:request" handler { assessChildExploitationSafety(); } }); "venice:streamChat" handler { assessChildExploitationSafety(); } });'
      );

      fs.writeFileSync(
        path.join(tmpDir, "server.ts"),
        "app.use(() => { assessChildExploitationSafety(); recordDecision(); });"
      );

      const result = runEnforcementChecks(tmpDir);
      expect(result).toEqual([]);
    });

    it("fails when veniceClient.ts has fewer than 2 guard calls", () => {
      const srcDir = path.join(tmpDir, "src", "services");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, "veniceClient.ts"), "function a() { assessChildExploitationSafety(); }");

      const electronDir = path.join(tmpDir, "electron", "ipc");
      fs.mkdirSync(electronDir, { recursive: true });
      fs.writeFileSync(
        path.join(electronDir, "handlers.ts"),
        '"venice:request" { assessChildExploitationSafety(); } }); "venice:streamChat" { assessChildExploitationSafety(); } });'
      );

      fs.writeFileSync(path.join(tmpDir, "server.ts"), "assessChildExploitationSafety(); recordDecision();");

      const result = runEnforcementChecks(tmpDir);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toContain("Renderer Transport");
    });

    it("fails when IPC handlers are missing guards", () => {
      const srcDir = path.join(tmpDir, "src", "services");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(
        path.join(srcDir, "veniceClient.ts"),
        "function a() { assessChildExploitationSafety(); } function b() { assessChildExploitationSafety(); }"
      );

      const electronDir = path.join(tmpDir, "electron", "ipc");
      fs.mkdirSync(electronDir, { recursive: true });
      fs.writeFileSync(
        path.join(electronDir, "handlers.ts"),
        '"venice:request" { /* no guard */ } }); "venice:streamChat" { assessChildExploitationSafety(); } });'
      );

      fs.writeFileSync(path.join(tmpDir, "server.ts"), "assessChildExploitationSafety(); recordDecision();");

      const result = runEnforcementChecks(tmpDir);
      expect(result.some((r: string) => r.includes("IPC handlers"))).toBe(true);
    });

    it("fails when server.ts is missing recordDecision", () => {
      const srcDir = path.join(tmpDir, "src", "services");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(
        path.join(srcDir, "veniceClient.ts"),
        "function a() { assessChildExploitationSafety(); } function b() { assessChildExploitationSafety(); }"
      );

      const electronDir = path.join(tmpDir, "electron", "ipc");
      fs.mkdirSync(electronDir, { recursive: true });
      fs.writeFileSync(
        path.join(electronDir, "handlers.ts"),
        '"venice:request" { assessChildExploitationSafety(); } }); "venice:streamChat" { assessChildExploitationSafety(); } });'
      );

      fs.writeFileSync(path.join(tmpDir, "server.ts"), "assessChildExploitationSafety();");

      const result = runEnforcementChecks(tmpDir);
      expect(result.some((r: string) => r.includes("Web Proxy Server"))).toBe(true);
    });
  });

  describe("scanForViolations", () => {
    it("flags raw prompt logging via console.log", () => {
      const srcDir = path.join(tmpDir, "src");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, "bad.ts"), "console.log('user said', userPrompt);");

      const result = scanForViolations(tmpDir);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toContain("bad.ts");
    });

    it("flags safety bypass toggles", () => {
      const srcDir = path.join(tmpDir, "src");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, "evil.ts"), "const bypass = true; // disable safety");

      const result = scanForViolations(tmpDir);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toContain("evil.ts");
    });

    it("ignores childExploitationGuard files", () => {
      const srcDir = path.join(tmpDir, "src");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, "childExploitationGuard.ts"), "console.log('scanning prompt');");

      const result = scanForViolations(tmpDir);
      expect(result).toEqual([]);
    });

    it("allows promptHash and promptTouched safe patterns", () => {
      const srcDir = path.join(tmpDir, "src");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(
        path.join(srcDir, "safe.ts"),
        "console.log('hash', promptHash); console.log('touched', promptTouched);"
      );

      const result = scanForViolations(tmpDir);
      expect(result).toEqual([]);
    });

    it("ignores node_modules and dist directories", () => {
      const nodeDir = path.join(tmpDir, "node_modules", "evil");
      fs.mkdirSync(nodeDir, { recursive: true });
      fs.writeFileSync(path.join(nodeDir, "bad.ts"), "console.log('user said', prompt);");

      const result = scanForViolations(tmpDir);
      expect(result).toEqual([]);
    });
  });

  describe("verifySafetyGuard", () => {
    it("returns ok=true when everything passes", () => {
      const srcDir = path.join(tmpDir, "src", "services");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(
        path.join(srcDir, "veniceClient.ts"),
        "function a() { assessChildExploitationSafety(); } function b() { assessChildExploitationSafety(); }"
      );

      const electronDir = path.join(tmpDir, "electron", "ipc");
      fs.mkdirSync(electronDir, { recursive: true });
      fs.writeFileSync(
        path.join(electronDir, "handlers.ts"),
        '"venice:request" { assessChildExploitationSafety(); } }); "venice:streamChat" { assessChildExploitationSafety(); } });'
      );

      fs.writeFileSync(path.join(tmpDir, "server.ts"), "assessChildExploitationSafety(); recordDecision();");

      const result = verifySafetyGuard(tmpDir);
      expect(result.ok).toBe(true);
    });

    it("returns ok=false when violations exist", () => {
      fs.writeFileSync(path.join(tmpDir, "server.ts"), "recordDecision();");

      const srcDir = path.join(tmpDir, "src");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, "bad.ts"), "console.log('user said', prompt);");

      const result = verifySafetyGuard(tmpDir);
      expect(result.ok).toBe(false);
      expect(result.enforcementFailures.length).toBeGreaterThan(0);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });
});
