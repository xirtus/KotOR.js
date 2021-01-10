const electron = require('electron');
// In main process.
const {ipcMain} = require('electron');
// Module to control application life.
const {app} = electron;
// Module to create native browser window.
const {BrowserWindow, Tray, Menu} = electron;
const {dialog} = electron;

console.log(process.argv);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let profileWindows = [];
let winLauncher = null;
let tray = null;

ipcMain.on('config-changed', (event, data) => {
  for(let i = 0, len = profileWindows.length; i < len; i++){
    profileWindows[i].webContents.send('config-changed', data);
  }
});

function createWindowFromProfile( profile = {} ) {
  // Create the browser window.
  let _window = new BrowserWindow({
    width: 1200, 
    height: 600,
    fullscreen: profile.launch.fullscreen,
    frame: !profile.launch.frameless,
    title: profile.name,
    backgroundColor: profile.launch.backgroundColor,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true
    }
  });

  _window.state = profile;

  // and load the index.html of the app.
  _window.loadURL(`file://${__dirname}/apps/${profile.launch.path}`);
  _window.setMenuBarVisibility(false);

  // Emitted when the window is closed.
  _window.on('closed', (event) => {
    event.preventDefault();
    createLauncherWindow();
    let index = profileWindows.indexOf(_window);
    if(index >= 0){
      profileWindows.splice(index, 1);
    }
  });

  winLauncher.hide();
  profileWindows.push(_window);

}

function createLauncherWindow() {

  if(winLauncher instanceof BrowserWindow){
    winLauncher.show();
    winLauncher.focus();
    return;
  }

  // Create the browser window.
  winLauncher = new BrowserWindow({
    width: 1200, 
    height: 600, 
    minHeight: 600,
    minWidth: 1000,
    frame: false,
    title: 'KotOR Launcher',
    backgroundColor: "#000000",
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });
  // and load the index.html of the app.
  winLauncher.loadURL(`file://${__dirname}/launcher/launcher.html`);
  //winLauncher.openDevTools();
  //winLauncher.on('ready', () => {
    //winLauncher.webcontents.openDevTools();
  //})

  // Emitted when the window is closed.
  winLauncher.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    winLauncher = null;
  });

  winLauncher.on('minimize',(event) => {
    event.preventDefault();
    winLauncher.hide();
  });

  winLauncher.on('close', (event) => {
    /*if(!app.isQuiting){
      event.preventDefault();
      winLauncher.hide();
    }

    return false;*/
  });
  
  winLauncher.on('show', () => {
    //tray.setHighlightMode('always');
  });

  winLauncher.on('hide', () => {
    //tray.setHighlightMode('never');
  });

}

ipcMain.on('launch_profile', (event, profile) => {
  createWindowFromProfile(profile);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', () => {

  tray = new Tray('icon.png');
  const contextMenu = Menu.buildFromTemplate([{
    label: 'Exit', 
    type: 'normal', 
    click: (menuItem, browserWindow, event) => {
      app.quit();
    }
  }]);
  tray.setToolTip('KotOR Launcher');
  tray.setContextMenu(contextMenu);

  createLauncherWindow();

  tray.on('click', () => {
    if(winLauncher instanceof BrowserWindow){
      winLauncher.isVisible() ? winLauncher.hide() : winLauncher.show();
    }else{
      createLauncherWindow();
    }
  });

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null)
  createLauncherWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.