#!/usr/bin/env node
/**
 * Production server entrypoint.
 * Ensures NODE_ENV is set to "production" before starting the Express server.
 */
process.env.NODE_ENV = "production";
const { startServer } = require("../dist/server.cjs");
startServer();
