// electron/main.js

import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess;

function startBackend() {

    const backendPath = app.isPackaged
        ? path.join(process.resourcesPath, "backend", "server.js")
        : path.join(__dirname, "../backend/server.js");

    console.log("Starting backend from:", backendPath);

    backendProcess = spawn("node", [backendPath], {
        stdio: "inherit",
        shell: true,
        env: {
            ...process.env,
            APP_DATA_PATH: app.getPath("userData")
        }
    });

    backendProcess.on("close", (code) => {
        console.log("Backend exited:", code);
    });
}

function createWindow() {

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const indexPath = app.isPackaged
        ? path.join(app.getAppPath(), "frontend", "dist", "index.html")
        : path.join(__dirname, "../frontend/dist/index.html");

    console.log("Loading frontend from:", indexPath);

    win.loadFile(indexPath);
}

function waitForBackend(retries = 20) {

    const http = require("http");

    return new Promise((resolve) => {

        const attempt = () => {

            const req = http.get("http://localhost:3000/health", () => {
                resolve(true);
            });

            req.on("error", () => {

                if (retries === 0) {
                    console.error("Backend did not start");
                    resolve(false);
                    return;
                }

                retries--;
                setTimeout(attempt, 500);
            });

        };

        attempt();
    });

}

app.whenReady().then(async () => {

    startBackend();

    await waitForBackend();

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

});

app.on("window-all-closed", () => {

    if (backendProcess) backendProcess.kill();

    if (process.platform !== "darwin") {
        app.quit();
    }

});