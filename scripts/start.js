const { spawn } = require("node:child_process");
const { rm } = require("node:fs/promises");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const generatedDirectories = ["dev", "docs"];
const npmRunAll = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "npm-run-all.cmd" : "npm-run-all"
);
const signalExitCodes = {
  SIGHUP: 129,
  SIGINT: 130,
  SIGTERM: 143,
};

let developmentServer;
let requestedSignal;
let forceKillTimer;

async function cleanGeneratedDirectories() {
  await Promise.all(
    generatedDirectories.map((directory) =>
      rm(path.join(projectRoot, directory), { recursive: true, force: true })
    )
  );
}

function signalServer(signal) {
  if (!developmentServer?.pid) return;

  try {
    if (process.platform === "win32") {
      developmentServer.kill(signal);
    } else {
      // The detached child owns the process group containing npm-run-all,
      // Eleventy, and Sass, so one signal shuts down the entire local server.
      process.kill(-developmentServer.pid, signal);
    }
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

function handleShutdownSignal(signal) {
  if (requestedSignal) {
    signalServer("SIGKILL");
    return;
  }

  requestedSignal = signal;
  signalServer(signal);

  forceKillTimer = setTimeout(() => signalServer("SIGKILL"), 5_000);
  forceKillTimer.unref();
}

for (const signal of Object.keys(signalExitCodes)) {
  process.on(signal, () => handleShutdownSignal(signal));
}

async function run() {
  let exitCode = 1;

  try {
    await cleanGeneratedDirectories();

    developmentServer = spawn(npmRunAll, ["--parallel", "watch:*"], {
      cwd: projectRoot,
      detached: process.platform !== "win32",
      stdio: "inherit",
    });

    const result = await new Promise((resolve) => {
      developmentServer.once("error", (error) => resolve({ error }));
      developmentServer.once("close", (code, signal) =>
        resolve({ code, signal })
      );
    });

    if (result.error) {
      console.error(
        `Unable to start the development server: ${result.error.message}`
      );
    } else if (requestedSignal) {
      exitCode = signalExitCodes[requestedSignal] ?? 1;
    } else if (result.signal) {
      exitCode = signalExitCodes[result.signal] ?? 1;
    } else {
      exitCode = result.code ?? 1;
    }
  } finally {
    clearTimeout(forceKillTimer);

    try {
      await cleanGeneratedDirectories();
    } catch (error) {
      console.error(`Failed to clean generated output: ${error.message}`);
      exitCode = 1;
    }
  }

  process.exitCode = exitCode;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
