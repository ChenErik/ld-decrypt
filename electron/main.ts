import path from 'node:path'
import { existsSync } from 'node:fs'
import { exec } from 'node:child_process'
import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
    },
  })
  win.setMenuBarVisibility(false)
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date()).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  }
  else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0)
    createWindow()
})

app.whenReady().then(createWindow)

ipcMain.handle('select-file', async (): Promise<string[]> => {
  const win = BrowserWindow.getFocusedWindow()
  const { filePaths } = await dialog.showOpenDialog(win!, { title: '选择文件', properties: ['openFile'] })
  return filePaths
})
ipcMain.handle('select-folder', async (): Promise<string[]> => {
  const win = BrowserWindow.getFocusedWindow()
  const { filePaths } = await dialog.showOpenDialog(win!, { title: '选择文件', properties: ['openDirectory'] })
  return filePaths
})
ipcMain.handle('decrypt-file', async (_event, filePath: string, outputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const isPackaged = existsSync(path.join(process.resourcesPath, 'app.asar'))
    const nodeBinPath = isPackaged
      ? path.join(process.resourcesPath, '../node-bin') // 生产环境（打包后）
      : path.join(__dirname, '../node-bin') // 开发环境
    const nodePath = path.join(nodeBinPath, 'node.exe')
    const decryptPath = path.join(nodeBinPath, 'decrypt.js')
    const command = `"${nodePath}" "${decryptPath}" "${filePath}" "${outputPath}"`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      if (stderr) {
        reject(stderr)
        return
      }
      resolve(stdout)
    })

    // const readStream = fs.createReadStream(filePath)
    // const fileName = path.basename(filePath)
    // const writeStream = fs.createWriteStream(path.join(outputPath, fileName))
    // readStream.pipe(writeStream)
    // writeStream.on('finish', () => {
    //   resolve(true)
    // })
    // writeStream.on('error', () => {
    //   reject(new Error('文件解密失败'))
    // })
  })
})
ipcMain.handle('open-path', async (_event, path): Promise<string> => {
  const res = await shell.openPath(path)
  return res
})
