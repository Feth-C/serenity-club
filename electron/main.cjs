// electron/main.cjs

const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const fs = require('fs');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// ========================
// 🔒 SINGLE INSTANCE LOCK
// ========================
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

// ========================
// STATE SAFE FLAGS
// ========================
let backend = null;
let backendStarted = false;
let updateChecked = false;

// ========================
// BACKEND START (SAFE)
// ========================
function startBackend() {
  if (backendStarted) return;
  backendStarted = true;

  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "serenity_club.sqlite");

  // SE O BANCO NÃO EXISTE NO APPDATA, ELE CRIA UM NOVO (OU COPIA O TEMPLATE)
  if (!fs.existsSync(dbPath)) {
    console.log("[DATABASE] Banco não encontrado. Criando novo em:", dbPath);
    // Aqui seu script de migração (migrateDb.js) entrará em ação automaticamente
    // pois o server.js vai rodar e não encontrará dados.
  }

  process.env.DB_PATH = dbPath;
  process.env.NODE_ENV = "production";
  process.env.PORT = "3000";

  if (app.isPackaged) {
    // EM PRODUÇÃO: Importamos o servidor diretamente
    // Isso é muito mais leve e evita problemas de permissão do Windows
    try {
      console.log("[BACKEND] Tentando carregar server.js...");
      require(path.join(app.getAppPath(), "backend", "server.js"));
      console.log("[BACKEND] Require finalizado com sucesso");
    } catch (err) {
      console.error("[BACKEND CRITICAL ERROR]", err);
      // Isso vai criar uma caixa de mensagem no Windows mostrando o erro real
      const { dialog } = require('electron');
      dialog.showErrorBox("Erro no Backend", err.message + "\n" + err.stack);
    }
  } else {
    // EM DESENVOLVIMENTO: Mantemos o spawn para facilitar o debug
    const backendPath = path.join(__dirname, "../backend/server.js");
    backend = spawn("node", [backendPath], {
      env: { ...process.env },
      stdio: "inherit"
    });
    console.log("[BACKEND] Started via spawn (Dev)");
  }
}

// ========================
// WINDOW
// ========================
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    fullscreen: true,
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default', // Visual elegante no Mac
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    const indexPath = path.join(
      app.getAppPath(),
      "frontend",
      "dist",
      "index.html"
    );

    console.log("[FRONTEND] loading:", indexPath);
    win.loadFile(indexPath);
  }

  win.once("ready-to-show", () => {
    win.show();
    win.maximize();
  });

  // ========================
  // ⌨️ ATALHOS DE TECLADO
  // ========================
  // Atalho para alternar FullScreen (F11 ou Cmd+Ctrl+F)
  const toggleFull = () => {
    const isFull = win.isFullScreen();
    win.setFullScreen(!isFull);
  };

  const closeApp = () => {
    app.quit();
  };

  win.on('focus', () => {
    globalShortcut.register('F11', toggleFull);
    globalShortcut.register('Escape', () => win.setFullScreen(false)); // Esc sai do FullScreen
    globalShortcut.register('CommandOrControl+F', toggleFull);
    globalShortcut.register('CommandOrControl+W', closeApp); // Atalho para fechar
  });

  win.on('blur', () => {
    globalShortcut.unregisterAll();
  });
}

// ========================
// AUTO UPDATE (SAFE ONCE)
// ========================
function setupAutoUpdate() {
  if (updateChecked) return;
  updateChecked = true;

  if (!app.isPackaged) return;

  autoUpdater.autoDownload = false;

  // 🔒 garante execução única real
  autoUpdater.once("checking-for-update", () => {
    console.log("[AUTO UPDATE] checking once");
  });

  autoUpdater.once("update-available", (info) => {
    console.log("[AUTO UPDATE] update available:", info.version);
  });

  autoUpdater.once("update-not-available", () => {
    console.log("[AUTO UPDATE] no update available");
  });

  autoUpdater.once("error", (err) => {
    console.error("[AUTO UPDATE ERROR]", err);
  });

  // 🔥 EXECUTA APENAS UMA VEZ
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => { });
  }, 5000);
}

// ========================
// APP LIFECYCLE SAFE START
// ========================
app.whenReady().then(() => {
  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
  }

  createWindow();
  startBackend();
  setupAutoUpdate();
});

// ========================
// CLEAN EXIT
// ========================
app.on("window-all-closed", () => {
  if (backend) backend.kill();
  if (process.platform !== "darwin") app.quit();
});