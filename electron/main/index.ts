import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Tray,
  Menu,
  globalShortcut,
  clipboard,
} from "electron";
import { release } from "node:os";
import { join } from "node:path";
import { update } from "./update";
import { Key, keyboard } from "@nut-tree-fork/nut-js";
import { PublicKey } from "@solana/web3.js";

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
let isQuiting = false;

// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

async function createTray() {
  // Create a system tray icon
  const trayIconPath = join(process.env.PUBLIC, "logo.png"),
    tray = new Tray(trayIconPath);

  // Create a context menu for the system tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open App",
      click: () => {
        win && win.show(); // Show the app window when the menu item is clicked
      },
    },
    {
      label: "Quit",
      click: () => {
        isQuiting = true;
        app.quit(); // Quit the app when the menu item is clicked
      },
    },
  ]);

  tray.setToolTip("Bot running");

  // Set the context menu for the system tray
  tray.setContextMenu(contextMenu);

  // Handle double-clicking the tray icon to restore the app window
  tray.on("double-click", () => {
    win && win.show();
  });
}

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
      // devTools: !import.meta.env.PROD
      devTools: true,
    },
    width: 1280,
    height: 900,
  });

  if (url) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  win.on("close", (event) => {
    if (!isQuiting) {
      event.preventDefault(); // Prevent the default behavior of quitting the app

      // Hide the window instead
      win && win.hide();
    }
  });

  // Apply electron-updater
  update(win);

  await createTray();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

//////////////////////////////////////////////

// async function startListen() {
//   app.on("ready", () => {
//     // Register a global shortcut for the F1 key
//     const success = globalShortcut.register(
//       "CommandOrControl+Shift+C",
//       async () => {
//         setTimeout(async () => {
//           await keyboard.pressKey(Key.LeftControl, Key.C);
//           await keyboard.releaseKey(Key.LeftControl, Key.C);
//           const copiedText = clipboard.readText().trim();
  
//           try {
//             new PublicKey(copiedText);
//             shell.openExternal(`https://gmgn.ai/sol/token/${copiedText}`);
//             shell.openExternal(`https://x.com/search?q=${copiedText}&src=typed_query`);
//           } catch (error) {}
//         }, 100)
//       }
//     );

//     if (!success) {
//       console.log("Failed to register the global shortcut");
//     }

//     console.log("Global shortcut registered!");
//   });
// }
// startListen();

ipcMain.handle('registerShortcut', async (event, data: {
  shortcut: string;
  urls: string[],
  isFilterSolAddress: boolean
}) => {
  globalShortcut.unregisterAll();
  if (!data.shortcut || !data.urls.length) {
    console.log("Something wrong!");
    return;
  }
  const success = globalShortcut.register(
    data.shortcut,
    async () => {
      setTimeout(async () => {
        await keyboard.pressKey(Key.LeftControl, Key.C);
        await keyboard.releaseKey(Key.LeftControl, Key.C);
        const copiedText = clipboard.readText().trim();

        try {
          let text: string | undefined = copiedText;
          if (data.isFilterSolAddress) {
            text = copiedText.split(" ").map(item => item.trim()).find(item => {
              try {
                new PublicKey(item);
                return true;
              } catch (error) {
                return false
              }
            })
          }
          if (!text) return;
          data.urls.map(url => {
            shell.openExternal(url.replaceAll("{copiedText}", text));
          })
        } catch (error) {}
      }, 100)
    }
  );
  if (!success) {
    console.log("Failed to register the global shortcut");
  }
});