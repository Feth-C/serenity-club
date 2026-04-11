// electron/main.js

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

let backendProcess = null;

function startBackend() {
  const backendPath = path.join(__dirname, "..", "backend", "server.js");

  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "serenity_club.sqlite");

  console.log("[BACKEND] Starting...");
  console.log("[BACKEND] Path:", backendPath);
  console.log("[BACKEND] DB:", dbPath);

  let started = false;
  let retries = 0;
  const maxRetries = 3;

  const startProcess = () => {
    const child = spawn(process.execPath, [backendPath], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
      env: {
        ...process.env,
        DB_PATH: dbPath
      }
    });

    backendProcess = child;

    child.on("error", (err) => {
      console.error("[BACKEND] Failed to start:", err);
    });

    child.on("exit", (code, signal) => {
      console.log("[BACKEND] Exit code:", code, "signal:", signal);

      clearTimeout(startupTimeout);

      if (!started) {
        console.log("[BACKEND] Crashed during startup. Code:", code);

        if (retries < maxRetries) {
          retries++;
          console.log(`[BACKEND] Retry ${retries}/${maxRetries}`);
          setTimeout(startProcess, 2000);
        } else {
          console.log("[BACKEND] Max retries reached. Giving up.");
        }
      } else {
        console.log("[BACKEND] Process exited normally. Code:", code);
      }
    });

    // marca como iniciado após 2s estável
    setTimeout(() => {
      started = true;
      console.log("[BACKEND] Ready and stable");
    }, 2000);
  };

  startProcess();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800
  });

  const indexPath = path.join(__dirname, "..", "frontend", "dist", "index.html");

  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  // 🔥 AUTO UPDATE CHECK
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 5000);
});

autoUpdater.on("update-available", () => {
  console.log("[UPDATE] Update available...");
});

autoUpdater.on("update-downloaded", () => {
  console.log("[UPDATE] Update downloaded. Installing...");

  setTimeout(() => {
    if (backendProcess) {
      backendProcess.kill();
    }

    autoUpdater.quitAndInstall();
  }, 3000);
});


app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill("SIGTERM");
    backendProcess = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});