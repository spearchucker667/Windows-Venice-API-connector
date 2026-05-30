import fs from "fs";
import path from "path";

/**
 * Core containment check: resolves symlinks via realpath and verifies that
 * targetPath is either root/index.html or strictly inside root.
 */
export function checkPathContained(targetPath: string, rootPath: string): boolean {
  let resolvedTarget: string;
  try {
    resolvedTarget = fs.realpathSync(path.normalize(targetPath));
  } catch {
    return false;
  }
  let resolvedRoot: string;
  try {
    resolvedRoot = fs.realpathSync(path.normalize(rootPath));
  } catch {
    return false;
  }
  const indexHtml = path.join(resolvedRoot, "index.html");
  if (process.platform === "win32") {
    return resolvedTarget.toLowerCase() === indexHtml.toLowerCase() ||
      resolvedTarget.toLowerCase().startsWith(`${resolvedRoot.toLowerCase()}${path.sep}`);
  }
  return resolvedTarget === indexHtml || resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`);
}
