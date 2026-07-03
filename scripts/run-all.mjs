import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function run(script) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("node", [resolve(__dirname, script)], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${script} exited with code ${code}`));
    });
  });
}

async function main() {
  await run("setup-database.mjs");
  await run("seed-data.mjs");
  await run("test-flow.mjs");
}

main().catch((error) => {
  console.error("\nPipeline failed:", error.message);
  process.exit(1);
});
