import { release } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { app, BrowserWindow, ipcMain, shell } from 'electron'

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1'))
  app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32')
  app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let win: BrowserWindow | null = null
let libPath = ''
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

function createWindow() {
  win = new BrowserWindow({
    title: 'Penta Quest',
    icon: join(process.env.PUBLIC, 'Logo.png'),
    minWidth: 800,
    minHeight: 600,
    width: 1280,
    height: 720,
    resizable: false,
    center: true,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  win.removeMenu()
  win.setBackgroundColor('#353535')

  // kill(8080).then(console.log).catch(console.log)

  if (process.env.VITE_DEV_SERVER_URL) {
    libPath = join(process.cwd(), 'backendLocal.jar')
    win.loadURL(url)
    win.webContents.openDevTools({ mode: 'undocked', activate: false })
  }
  else {
    if (process.platform === 'darwin')
      libPath = join(process.cwd(), 'Contents', 'Resources', 'backendOnline.jar')

    else
      libPath = join(process.cwd(), 'resources', 'backendOnline.jar')

    win.loadFile(indexHtml)
    win.webContents.openDevTools({ mode: 'undocked', activate: false }) // TODO: DA TOGLIERE APPENA RISOLTO L'ERRORE
  }

  // exec(`java -jar ${libPath}`, console.log)

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', `Backend jar path : ${libPath}`)
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:'))
      shell.openExternal(url)
    return { action: 'deny' }
  })

  ipcMain.handle('close-window', () => win!.close())

  ipcMain.handle('toggle-fullscreen', (event, arg) => win!.setFullScreen(arg))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized())
      win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length)
    allWindows[0].focus()

  else
    createWindow()
})

ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL)
    childWindow.loadURL(`${url}#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })

  else
    childWindow.loadFile(indexHtml, { hash: arg })
})
