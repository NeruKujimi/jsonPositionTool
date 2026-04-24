const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露electron API
contextBridge.exposeInMainWorld('electron', {
  app: {
    quit: () => ipcRenderer.send('quit-app')
  },
  // 启动画面相关
  splashReady: () => ipcRenderer.send('splash-ready')
});
