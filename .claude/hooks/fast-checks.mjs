// Claude Code PostToolUse hook: after Claude edits a file, run the fast checks
// for the part of the repo that changed. Exit code 2 sends the output back to
// Claude so it fixes the problem; exit code 0 means nothing to report.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

// Upper-case the Windows drive letter: with a "c:\" working directory Vitest loads
// its own modules twice ("c:" and "C:") and every test file fails to start.
const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
const root = projectDir.charAt(0).toUpperCase() + projectDir.slice(1);
const input = JSON.parse(readFileSync(0, "utf8"));
const filePath = input.tool_input?.file_path;
if (!filePath) process.exit(0);

const rel = path.relative(root, path.resolve(root, filePath)).split(path.sep).join("/");
const venvBin = process.platform === "win32" ? ".venv/Scripts" : ".venv/bin";
const backend = path.join(root, "backend");
const frontend = path.join(root, "frontend");

/** @type {Array<{ cwd: string, cmd: string, args: string[] }>} */
let checks = [];
if (rel.startsWith("backend/") && rel.endsWith(".py")) {
  checks = [
    { cwd: backend, cmd: path.join(backend, venvBin, "ruff"), args: ["check", path.join(root, rel)] },
    { cwd: backend, cmd: path.join(backend, venvBin, "python"), args: ["-m", "pytest", "tests/unit", "-q"] },
  ];
} else if (rel.startsWith("frontend/") && /\.(ts|tsx|js|jsx|mjs|mts)$/.test(rel)) {
  checks = [
    { cwd: frontend, cmd: process.execPath, args: ["node_modules/eslint/bin/eslint.js", path.join(root, rel)] },
    { cwd: frontend, cmd: process.execPath, args: ["node_modules/vitest/vitest.mjs", "run"] },
  ];
}

let failed = false;
for (const { cwd, cmd, args } of checks) {
  const result = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    failed = true;
    const name = [path.basename(cmd), ...args].join(" ");
    process.stderr.write(`Check failed: ${name}\n${result.stdout ?? ""}${result.stderr ?? ""}${result.error ?? ""}\n`);
  }
}
process.exit(failed ? 2 : 0);
