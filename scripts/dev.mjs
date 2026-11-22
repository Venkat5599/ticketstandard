import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const processes = [];
const next = spawn(process.execPath, [resolve(root, "node_modules", "next", "dist", "bin", "next"), "dev", ...process.argv.slice(2)], { cwd: root, stdio: "inherit", windowsHide: true });
processes.push(next);
next.on("exit", (code) => {
  for (const child of processes) if (child !== next) child.kill();
  process.exit(code ?? 0);
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
  for (const child of processes) child.kill(signal);
});
