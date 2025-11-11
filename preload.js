const { contextBridge, ipcRenderer } = require("electron")



contextBridge.exposeInMainWorld("electronAPI", {
  launchProgram: (programPath) => ipcRenderer.invoke("launch-program", programPath),
  selectFile: (options) => ipcRenderer.invoke("select-file", options),
  windowControl: (action) => ipcRenderer.send("window-control", action),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  createTray: () => ipcRenderer.send("create-tray"),

  readImageAsDataURL: (filePath) => ipcRenderer.invoke("read-image-as-data-url", filePath),

  enableMiniApp: () => ipcRenderer.invoke("enable-mini-app"),
  disableMiniApp: () => ipcRenderer.invoke("disable-mini-app"),
  getMiniAppStatus: () => ipcRenderer.invoke("get-mini-app-status"),

  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  onUpdateStatus: (callback) => {
    ipcRenderer.on("update-status", (event, data) => callback(data))
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on("update-progress", (event, data) => callback(data))
  },
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners("update-status")
    ipcRenderer.removeAllListeners("update-progress")
  },
})

