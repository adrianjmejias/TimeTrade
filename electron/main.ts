import {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  Tray,
  Notification,
  //ipcMain,
} from "electron";
//import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
//import axios from "axios";

//const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let tray: Tray | null;

const notifyUser = (message: string) => {
  const notification = new Notification({
    title: "Time Trade",
    body: message,
    timeoutType: "default",
  });
  notification.show();
};

let isQuitting = false;

/* async function onGameEnd(duration: number) {
  try {
    const response = await axios.get(
      `http://localhost:8080/products?keyword=self-improvement&duration=${duration}s`
    );
    const recommendations = response.data;

    // Send the recommendations to the renderer process
    win?.webContents.send("game-end-recommendations", recommendations);

    notifyUser("Game ended. Check out these self-improvement recommendations!");
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    notifyUser("Game ended. Unable to fetch recommendations.");
  }
} */

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.webContents.openDevTools();
  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  win.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win?.hide();
      notifyUser(
        `We're still tracking your time, when the match ends we'll show the results`
      );
    }
  });

  // Listen for game end event from renderer process
  /* ipcMain.on("game-ended", (_event, duration) => {
    onGameEnd(duration);
  }); */
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

export const minimizeToTray = () => {
  win?.close();
};

export const showApp = () => {
  win?.show();
};

app.whenReady().then(() => {
  createWindow();
  const trayIconPath = path.join(__dirname, "../src/assets/clock.jpg");
  tray = new Tray(nativeImage.createFromPath(trayIconPath));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show app",
      click: () => {
        win?.show();
      },
    },
    {
      label: "Close app",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Time trade");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    win?.isVisible() ? win.hide() : win?.show();
  });
});
