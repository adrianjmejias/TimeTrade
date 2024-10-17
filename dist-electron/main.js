import { app, BrowserWindow, Tray, nativeImage, Menu, Notification } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let tray;
const notifyUser = (message) => {
  const notification = new Notification({
    title: "Time Trade",
    body: message,
    timeoutType: "default"
  });
  notification.show();
};
let isQuitting = false;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.webContents.openDevTools();
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win == null ? void 0 : win.hide();
      notifyUser(
        `We're still tracking your time, when the match ends we'll show the results`
      );
    }
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
const minimizeToTray = () => {
  win == null ? void 0 : win.close();
};
const showApp = () => {
  win == null ? void 0 : win.show();
};
app.whenReady().then(() => {
  createWindow();
  const trayIconPath = path.join(__dirname, "../src/assets/clock.jpg");
  tray = new Tray(nativeImage.createFromPath(trayIconPath));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show app",
      click: () => {
        win == null ? void 0 : win.show();
      }
    },
    {
      label: "Close app",
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip("Time trade");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    (win == null ? void 0 : win.isVisible()) ? win.hide() : win == null ? void 0 : win.show();
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL,
  minimizeToTray,
  showApp
};
