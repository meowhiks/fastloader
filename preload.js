const { contextBridge, ipcRenderer } = require("electron")



contextBridge.exposeInMainWorld("electronAPI", {
  launchProgram: (programPath, programId) => ipcRenderer.invoke("launch-program", programPath, programId),
  selectFile: (options) => ipcRenderer.invoke("select-file", options),
  windowControl: (action) => ipcRenderer.send("window-control", action),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  createTray: () => ipcRenderer.send("create-tray"),
  updateTrayMenu: () => ipcRenderer.send("update-tray-menu"),

  readImageAsDataURL: (filePath) => ipcRenderer.invoke("read-image-as-data-url", filePath),

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
  onProgramLaunched: (callback) => {
    ipcRenderer.on("program-launched", (event, data) => callback(data))
  },
  saveProgramsData: (data) => ipcRenderer.send("save-programs-data", data),
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners("update-status")
    ipcRenderer.removeAllListeners("update-progress")
  },
})

