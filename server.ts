import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";

const PORT = Number(process.env.PORT || 3000);
const MAX_PROXY_BODY_BYTES = Number(process.env.MAX_PROXY_BODY_BYTES || 25 * 1024 * 1024);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 60);

const ALLOWED_VENICE_ENDPOINTS = [
  /^\/models(?:\?.*)?$/,
  /^\/chat\/completions$/,
  /^\/image\/generate$/,
  /^\/image\/upscale$/,
  /^\/augment\/search$/,
  /^\/augment\/scrape$/,
  /^\/augment\/text-parser$/,
];

const ALLOWED_METHODS = new Set(["GET", "POST", "OPTIONS"]);
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: express.Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() || req.ip || "unknown";
  }
  return req.ip || "unknown";
}

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const now = Date.now();
  const key = getClientIp(req);
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      error: "Rate limit exceeded for local Venice proxy.",
      retryAfterSeconds,
    });
  }

  bucket.count += 1;
  return next();
}

function validateVeniceProxyRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!process.env.VENICE_API_KEY) {
    return res.status(500).json({
      error: "Server is missing VENICE_API_KEY. Configure it in the server environment before using Venice API features.",
    });
  }

  if (!ALLOWED_METHODS.has(req.method)) {
    return res.status(405).json({ error: "Method not allowed for Venice proxy." });
  }

  const original = req.originalUrl.replace(/^\/api\/venice/, "") || "/";
  if (!ALLOWED_VENICE_ENDPOINTS.some((pattern) => pattern.test(original))) {
    return res.status(403).json({ error: "Venice proxy endpoint is not allowed by this app." });
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_PROXY_BODY_BYTES) {
    return res.status(413).json({
      error: "Request body too large for local Venice proxy.",
      maxBytes: MAX_PROXY_BODY_BYTES,
    });
  }

  return next();
}

async function startServer() {
  const app = express();
  app.disable("x-powered-by");

  // Venice API Proxy
  // Do NOT use body-parser for /api/venice. We want raw passthrough for JSON and multipart uploads.
  app.use(
    "/api/venice",
    rateLimit,
    validateVeniceProxyRequest,
    createProxyMiddleware({
      target: "https://api.venice.ai/api/v1",
      changeOrigin: true,
      pathRewrite: {
        "^/api/venice": "",
      },
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader("Authorization", `Bearer ${process.env.VENICE_API_KEY}`);
        },
        proxyRes: (proxyRes) => {
          proxyRes.headers["x-proxy-by"] = "venice-forge";
        },
        error: (err, req, res) => {
          console.error("Venice proxy error:", err.message);
          if (!res.headersSent) {
            res.writeHead(502, { "Content-Type": "application/json" });
          }
          res.end(JSON.stringify({ error: "Venice proxy request failed." }));
        },
      },
    })
  );

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
