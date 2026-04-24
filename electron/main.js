const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 保持对窗口对象的全局引用，否则窗口会在垃圾回收时自动关闭
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    frame: false, // 隐藏默认标题栏
    webPreferences: {
      // 启用Node.js集成
      nodeIntegration: true,
      contextIsolation: false,
      // 预加载脚本
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 加载应用
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    // 开发环境加载Vite服务器
    mainWindow.loadURL('http://localhost:5173');
    // 开发环境打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境加载根目录的HTML文件
    const indexPath = path.join(__dirname, '../index.html');
    const appPath = path.join(process.resourcesPath, 'app', 'index.html');
    
    // 尝试不同的路径
    if (require('fs').existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else if (require('fs').existsSync(appPath)) {
      mainWindow.loadFile(appPath);
    } else {
      // 如果都找不到，显示错误信息
      mainWindow.loadHTML(`
        <html>
          <body>
            <h1>Error: Could not find index.html</h1>
            <p>Please check if the application was built correctly.</p>
            <p>Expected paths:</p>
            <ul>
              <li>${indexPath}</li>
              <li>${appPath}</li>
            </ul>
          </body>
        </html>
      `);
    }
  }

  // 窗口关闭时触发
  mainWindow.on('closed', () => {
    // 取消引用窗口对象，通常如果应用支持多窗口，会将窗口存储在数组中
    mainWindow = null;
  });
}

// Electron完成初始化后创建窗口
app.on('ready', createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用程序和菜单栏通常保持活动状态，直到用户使用Cmd+Q显式退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当点击dock图标且没有其他窗口打开时，重新创建窗口
  if (mainWindow === null) {
    createWindow();
  }
});

// 监听退出请求
ipcMain.on('quit-app', () => {
  app.quit();
});