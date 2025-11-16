const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage, shell, screen } = require("electron")
const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const os = require("os")
const extractIcon = require("extract-file-icon")
const { autoUpdater } = require("electron-updater")


let mainWindow
let tray = null
let forceQuit = false

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  process.exit(0)
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      showWindow()
    }
  })
}


let mouseTrackingInterval = null
let isMouseInCorner = false
let cornerThreshold = 100
let showDelay = 500
let hideDelay = 1000
let showTimeout = null
let hideTimeout = null


const getSettingsPath = () => path.join(app.getPath("userData"), "settings.json")


function loadSettings() {
  const settingsPath = getSettingsPath()
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, "utf8"))
    }
  } catch (error) {
    console.error("Error loading settings:", error)
  }


  const defaultSettings = {
    theme: "light",
    opacity: 95,
    launchOnStartup: false,
    minimizeToTray: false,
    startMinimized: false,
  }


  try {
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings))
  } catch (error) {
    console.error("Error saving default settings:", error)
  }

  return defaultSettings
}


function createWindow() {

  const settings = loadSettings()

  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, "assets", "icon.ico"),
    show: false,
  })


  mainWindow.loadFile("index.html")


  mainWindow.once("ready-to-show", () => {

    if (settings.startMinimized) {

      createTray()
    } else {

      mainWindow.show()
    }
  })


  mainWindow.on("close", (event) => {

    const currentSettings = loadSettings()

    if (!forceQuit && currentSettings.minimizeToTray) {
      event.preventDefault()
      mainWindow.hide()
      return false
    }


  })

  mainWindow.on("minimize", (event) => {
    const currentSettings = loadSettings()
    if (!forceQuit && currentSettings.minimizeToTray) {
      event.preventDefault()
      mainWindow.hide()
    }
  })



}


function showWindow() {
  if (!mainWindow) return
  
  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const windowWidth = 900
  const windowHeight = 700
  const x = Math.floor((width - windowWidth) / 2) + primaryDisplay.workArea.x
  const y = Math.floor((height - windowHeight) / 2) + primaryDisplay.workArea.y
  
  mainWindow.setBounds({ x, y, width: windowWidth, height: windowHeight })
  mainWindow.show()
  mainWindow.focus()
}

function getFrequentlyUsedPrograms() {
  try {
    const programsDataPath = path.join(app.getPath("userData"), "programs.json")
    if (fs.existsSync(programsDataPath)) {
      const data = JSON.parse(fs.readFileSync(programsDataPath, "utf8"))
      const programs = data.programs || []
      const usageStats = data.usageStats || {}
      
      const programsWithUsage = programs.map(program => ({
        ...program,
        usageCount: usageStats[program.id] || 0,
        lastUsed: usageStats[`${program.id}_lastUsed`] || 0
      }))
      
      return programsWithUsage
        .filter(p => p.usageCount > 0)
        .sort((a, b) => {
          if (b.usageCount !== a.usageCount) {
            return b.usageCount - a.usageCount
          }
          return b.lastUsed - a.lastUsed
        })
        .slice(0, 10)
    }
  } catch (error) {
    console.error("Error loading frequently used programs:", error)
  }
  return []
}

function createTray() {
  if (tray) {
    updateTrayMenu()
    return
  }

  const iconPath = path.join(__dirname, "assets", "icon.png")
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)

  updateTrayMenu()

  tray.setToolTip("FastLoader")

  tray.on("double-click", () => {
    showWindow()
  })
}

function updateTrayMenu() {
  if (!tray) return
  
  const frequentlyUsed = getFrequentlyUsedPrograms()
  const menuItems = [
    {
      label: "Открыть FastLoader",
      click: () => {
        showWindow()
      },
    },
    { type: "separator" }
  ]

  if (frequentlyUsed.length > 0) {
    menuItems.push({ type: "separator" })
    menuItems.push({
      label: "Часто используемые программы",
      enabled: false
    })
    
    frequentlyUsed.forEach((program, index) => {
      menuItems.push({
        label: program.name,
        click: async () => {
          try {
            await launchProgramFromTray(program.path)
          } catch (error) {
            console.error("Error launching program from tray:", error)
          }
        }
      })
    })
    menuItems.push({ type: "separator" })
  }

  menuItems.push(
    {
      label: "Выход",
      click: () => {
        forceQuit = true
        app.quit()
      },
    }
  )

  const contextMenu = Menu.buildFromTemplate(menuItems)
  tray.setContextMenu(contextMenu)
}

async function launchProgramFromTray(programPath) {
  try {
    if (!fs.existsSync(programPath)) {
      return { success: false, error: "Файл не существует" }
    }

    if (process.platform === "win32") {
      const ext = path.extname(programPath).toLowerCase()
      if (ext === ".py") {
        const pythonPath = "python"
        const childProcess = exec(`"${pythonPath}" "${programPath}"`, { 
          detached: true, 
          stdio: "ignore",
          windowsHide: true
        }, (error) => {
          if (error) {
            console.error(`Error launching Python script: ${error}`)
          }
        })
        childProcess.unref()
        return { success: true }
      } else {
        shell.openPath(programPath).catch((error) => {
          console.error(`Error launching program: ${error}`)
        })
        return { success: true }
      }
    } else {
      const childProcess = exec(`"${programPath}"`, { 
        detached: true, 
        stdio: "ignore",
        windowsHide: true
      }, (error) => {
        if (error) {
          console.error(`Error launching program: ${error}`)
        }
      })
      childProcess.unref()
      return { success: true }
    }
  } catch (error) {
    console.error(`Exception launching program: ${error}`)
    return { success: false, error: error.message }
  }
}


function startGlobalMouseTracking() {
  if (mouseTrackingInterval) return
  
  mouseTrackingInterval = setInterval(() => {
    const { x, y } = screen.getCursorScreenPoint()
    const displays = screen.getAllDisplays()
    

    for (const display of displays) {
      const bounds = display.bounds
      const isInTopRight = x >= bounds.x + bounds.width - cornerThreshold && 
                          y <= bounds.y + cornerThreshold
      
      if (isInTopRight && !isMouseInCorner) {
        isMouseInCorner = true
        handleMouseEnterCorner()
      } else if (!isInTopRight && isMouseInCorner) {
        isMouseInCorner = false
        handleMouseLeaveCorner()
      }
    }
  }, 100)
}

function stopGlobalMouseTracking() {
  if (mouseTrackingInterval) {
    clearInterval(mouseTrackingInterval)
    mouseTrackingInterval = null
  }
  

  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

function handleMouseEnterCorner() {

  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  

  showTimeout = setTimeout(() => {
    if (isMouseInCorner && mainWindow && !mainWindow.isVisible()) {

      const displays = screen.getAllDisplays()
      const primaryDisplay = screen.getPrimaryDisplay()
      const bounds = primaryDisplay.bounds
      
      const windowWidth = 400
      const windowHeight = 300
      const x = bounds.x + bounds.width - windowWidth - 20
      const y = 20
      
      mainWindow.setBounds({ x, y, width: windowWidth, height: windowHeight })
      mainWindow.show()
      mainWindow.focus()
    }
  }, showDelay)
}

function handleMouseLeaveCorner() {

  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  

  hideTimeout = setTimeout(() => {
    if (!isMouseInCorner && mainWindow && mainWindow.isVisible()) {

      const { x, y } = screen.getCursorScreenPoint()
      const windowBounds = mainWindow.getBounds()
      
      const isOverWindow = x >= windowBounds.x && x <= windowBounds.x + windowBounds.width &&
                          y >= windowBounds.y && y <= windowBounds.y + windowBounds.height
      
      if (!isOverWindow) {
        mainWindow.hide()
      }
    }
  }, hideDelay)
}


autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true


autoUpdater.on("checking-for-update", () => {
  if (mainWindow) {
    mainWindow.webContents.send("update-status", { status: "checking" })
  }
})

autoUpdater.on("update-available", (info) => {
  if (mainWindow) {
    mainWindow.webContents.send("update-status", {
      status: "available",
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    })
  }
})

autoUpdater.on("update-not-available", () => {
  if (mainWindow) {
    mainWindow.webContents.send("update-status", { status: "not-available" })
  }
})

autoUpdater.on("error", (error) => {
  console.error("Auto-updater error:", error)
  if (mainWindow) {
    mainWindow.webContents.send("update-status", {
      status: "error",
      message: error.message,
    })
  }
})

autoUpdater.on("download-progress", (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send("update-progress", {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
    })
  }
})

autoUpdater.on("update-downloaded", (info) => {
  if (mainWindow) {
    mainWindow.webContents.send("update-status", {
      status: "downloaded",
      version: info.version,
    })
  }
})


app.whenReady().then(() => {
  createWindow()
  

  setTimeout(() => {
    if (!app.isPackaged) {
      console.log("Skipping update check in development mode")
    } else {
      autoUpdater.checkForUpdates()
    }
  }, 3000)


  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopGlobalMouseTracking()
    app.quit()
  }
})


app.on("before-quit", () => {
  stopGlobalMouseTracking()
})


ipcMain.handle("launch-program", async (event, programPath, programId) => {
  try {
    if (!fs.existsSync(programPath)) {
      return { success: false, error: "Файл не существует" }
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true)
    }

    if (process.platform === "win32") {
      const ext = path.extname(programPath).toLowerCase()
      if (ext === ".py") {
        const pythonPath = "python"
        const childProcess = exec(`"${pythonPath}" "${programPath}"`, { 
          detached: true, 
          stdio: "ignore",
          windowsHide: true
        }, (error) => {
          if (error) {
            console.error(`Error launching Python script: ${error}`)
          }
        })
        childProcess.unref()
        
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setAlwaysOnTop(false)
            if (mainWindow.isMinimized()) {
              mainWindow.restore()
            }
            mainWindow.focus()
          }
        }, 200)
        
        if (programId && mainWindow) {
          mainWindow.webContents.send("program-launched", { programId })
        }
        return { success: true }
      } else {
        shell.openPath(programPath).then((result) => {
          setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.setAlwaysOnTop(false)
              if (mainWindow.isMinimized()) {
                mainWindow.restore()
              }
              mainWindow.focus()
            }
          }, 200)
          
          if (result !== "") {
            console.error(`Error launching program: ${result}`)
          }
        }).catch((error) => {
          console.error(`Error launching program: ${error}`)
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setAlwaysOnTop(false)
            if (mainWindow.isMinimized()) {
              mainWindow.restore()
            }
            mainWindow.focus()
          }
        })
        
        if (programId && mainWindow) {
          mainWindow.webContents.send("program-launched", { programId })
        }
        return { success: true }
      }
    } else {
      const childProcess = exec(`"${programPath}"`, { 
        detached: true, 
        stdio: "ignore",
        windowsHide: true
      }, (error) => {
        if (error) {
          console.error(`Error launching program: ${error}`)
        }
      })
      childProcess.unref()
      
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.setAlwaysOnTop(false)
          if (mainWindow.isMinimized()) {
            mainWindow.restore()
          }
          mainWindow.focus()
        }
      }, 200)
      
      if (programId && mainWindow) {
        mainWindow.webContents.send("program-launched", { programId })
      }
      return { success: true }
    }
  } catch (error) {
    console.error(`Exception launching program: ${error}`)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(false)
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
    return { success: false, error: error.message }
  }
})


ipcMain.handle("select-file", async (event, options = {}) => {
  const dialogOptions = {
    properties: ["openFile"],
    filters: [
      { name: "Executables", extensions: ["exe", "bat", "cmd", "msi"] },
      { name: "All Files", extensions: ["*"] },
    ],
    ...options,
  }

  const result = await dialog.showOpenDialog(mainWindow, dialogOptions)

  if (result.canceled) {
    return { canceled: true }
  }

  const filePath = result.filePaths[0]
  let iconPath = null


  if (process.platform === "win32" && !options.isIconSelection) {
    try {
      const iconBuffer = extractIcon(filePath, 32)
      if (iconBuffer) {
        const tempIconPath = path.join(os.tmpdir(), `icon-${Date.now()}.png`)
        fs.writeFileSync(tempIconPath, iconBuffer)
        iconPath = tempIconPath
      }
    } catch (err) {
      console.error("Failed to extract icon:", err)
    }
  }

  return {
    canceled: false,
    filePath,
    iconPath,
    fileName: path.basename(filePath, path.extname(filePath)),
  }
})


ipcMain.on("window-control", (event, action) => {
  switch (action) {
    case "minimize":
      mainWindow.minimize()
      break
    case "maximize":
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
      break
    case "close":

      const settings = loadSettings()
      if (settings.minimizeToTray) {
        mainWindow.hide()
      } else {

        forceQuit = true
        app.quit()
      }
      break
    case "quit":
      forceQuit = true
      app.quit()
      break
  }
})


ipcMain.handle("get-settings", async () => {
  try {
    return loadSettings()
  } catch (error) {
    console.error("Error reading settings:", error)

    return {
      theme: "light",
      opacity: 95,
      launchOnStartup: false,
      minimizeToTray: false,
      startMinimized: false,
    }
  }
})

ipcMain.handle("save-settings", async (event, settings) => {
  try {
    const settingsPath = getSettingsPath()
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))


    app.setLoginItemSettings({
      openAtLogin: settings.launchOnStartup,
      openAsHidden: settings.startMinimized,
    })

    return { success: true }
  } catch (error) {
    console.error("Error saving settings:", error)
    return { success: false, error: error.message }
  }
})


ipcMain.on("create-tray", () => {
  createTray()
})

ipcMain.on("update-tray-menu", () => {
  updateTrayMenu()
})

ipcMain.on("save-programs-data", (event, data) => {
  try {
    const programsDataPath = path.join(app.getPath("userData"), "programs.json")
    fs.writeFileSync(programsDataPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Error saving programs data:", error)
  }
})


ipcMain.handle("read-image-as-data-url", async (event, filePath) => {
  try {

    if (!fs.existsSync(filePath)) {
      return null
    }


    const fileData = fs.readFileSync(filePath)


    let mimeType = "image/png" // По умолчанию
    if (filePath.toLowerCase().endsWith(".jpg") || filePath.toLowerCase().endsWith(".jpeg")) {
      mimeType = "image/jpeg"
    } else if (filePath.toLowerCase().endsWith(".ico")) {
      mimeType = "image/x-icon"
    } else if (filePath.toLowerCase().endsWith(".gif")) {
      mimeType = "image/gif"
    }


    const base64Data = fileData.toString("base64")
    return `data:${mimeType};base64,${base64Data}`
  } catch (error) {
    console.error("Error reading image file:", error)
    return null
  }
})


ipcMain.handle("check-for-updates", async () => {
  try {
    if (app.isPackaged) {
      await autoUpdater.checkForUpdates()
      return { success: true }
    } else {
      return { success: false, message: "Updates are only available in production builds" }
    }
  } catch (error) {
    console.error("Error checking for updates:", error)
    return { success: false, message: error.message }
  }
})

ipcMain.handle("download-update", async () => {
  try {
    if (app.isPackaged) {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } else {
      return { success: false, message: "Updates are only available in production builds" }
    }
  } catch (error) {
    console.error("Error downloading update:", error)
    return { success: false, message: error.message }
  }
})

ipcMain.handle("install-update", async () => {
  try {
    if (app.isPackaged) {
      autoUpdater.quitAndInstall(false, true)
      return { success: true }
    } else {
      return { success: false, message: "Updates are only available in production builds" }
    }
  } catch (error) {
    console.error("Error installing update:", error)
    return { success: false, message: error.message }
  }
})

ipcMain.handle("get-app-version", async () => {
  return app.getVersion()
})

