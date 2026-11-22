import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const python = resolve(root, "local_ai", ".venv", "Scripts", "python.exe");
if (!existsSync(python)) {
  console.error("Local AI is not installed. Run npm run ai:setup first.");
  process.exit(1);
}
const server = spawn(python, ["-m", "uvicorn", "local_ai.server:app", "--host", "127.0.0.1", "--port", "8765", "--no-access-log"], { cwd: root, stdio: "inherit", windowsHide: true });
server.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
