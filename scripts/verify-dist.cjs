#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const releaseDir = path.join(root, "release");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const escapedVersion = packageJson.version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function requireFile(filePath, minBytes) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing ${path.relative(root, filePath)}`);
  const stat = fs.statSync(filePath);
  if (stat.size < minBytes) {
    throw new Error(`${path.relative(root, filePath)} is unexpectedly small (${stat.size} bytes)`);
  }
  return stat.size;
}

try {
  if (!fs.existsSync(releaseDir)) throw new Error("Missing release folder.");
  requireFile(path.join(root, "dist", "index.html"), 100);
  requireFile(path.join(root, "dist-electron", "main.js"), 1000);
  requireFile(path.join(root, "dist-electron", "package.json"), 10);
  requireFile(path.join(root, "build", "icon.ico"), 1024);

  const files = fs.readdirSync(releaseDir);
  const setupPattern = new RegExp(`^Venice-Forge-${escapedVersion}-x64-Setup\\.exe$`);
  const portablePattern = new RegExp(`^Venice-Forge-${escapedVersion}-x64-Portable\\.exe$`);
  const setup = files.find((name) => setupPattern.test(name));
  const portable = files.find((name) => portablePattern.test(name));
  if (!setup) throw new Error("Missing NSIS setup exe in release/.");
  if (!portable) throw new Error("Missing portable exe in release/.");
  requireFile(path.join(releaseDir, setup), 1024 * 1024);
  requireFile(path.join(releaseDir, portable), 1024 * 1024);
  requireFile(path.join(releaseDir, `${setup}.sha256`), 64);
  requireFile(path.join(releaseDir, `${portable}.sha256`), 64);

  console.log(`[verify:dist] OK setup=${setup} portable=${portable}`);
} catch (err) {
  console.error(`[verify:dist] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
