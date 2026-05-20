// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createServerApp } from "./server";

describe("server.ts proxy validation", () => {
  let app: any;

  beforeAll(() => {
    app = createServerApp();
  });

  it("should allow valid endpoints", async () => {
    // Testing the validation logic to make sure the endpoint is allowed.
    // Given the upstream might not exist, it will likely return 502 Bad Gateway
    // But importantly, it should NOT return 403 Forbidden or 405 Method Not Allowed.
    const res = await request(app).get("/api/venice/models");
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(405);
  });

  it("should block disallowed endpoints", async () => {
    const res = await request(app).get("/api/venice/admin/users");
    expect(res.status).toBe(403);
  });

  it("should explicitly block path traversal attempts", async () => {
    const res1 = await request(app).get("/api/venice/%2e%2e/internal/secrets");
    expect(res1.status === 403 || res1.status === 404).toBe(true);

    const res2 = await request(app).get("/api/venice/models/../internal");
    expect(res2.status === 403 || res2.status === 404).toBe(true);
  });

  it("should block unallowed methods", async () => {
     const res = await request(app).delete("/api/venice/models");
     expect(res.status).toBe(405);
  });
});
