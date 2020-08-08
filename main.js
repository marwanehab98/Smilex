const electron = require("electron");
const url = require("url");
const path = require("path");

// const { webContents } = require("electron")
const { app, BrowserWindow, Menu, ipcMain } = electron;

process.env.NODE_ENV = "production";


let mainWindow;
let addPatientWindow;
let addVisitWindow;


app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 800,
    minHeight: 500,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });
  Menu.setApplicationMenu(null)
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "html/mainWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );
  // console.log('marwan1')

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send("load");

    mainWindow.show();
  })

  mainWindow.on("close", () => {
    mainWindow = null;
  });
});


ipcMain.on("patient:add", (e, doc) => {
  addPatientWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    width: 400,
    height: 510,

  });
  addPatientWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "html/addWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  addPatientWindow.once('ready-to-show', () => {
    if (doc != null) addPatientWindow.webContents.send("patient:edit", doc)
    addPatientWindow.show()
  })
  addPatientWindow.on("close", (evt) => {
    evt.preventDefault();
    addPatientWindow.hide();
    addPatientWindow = null;
  });
});


ipcMain.on("patient:added", function (e, doc) {
  mainWindow.webContents.send("patient:add", doc);
  addPatientWindow.close();
});


ipcMain.on("visit:add", (e, doc, visit) => {
  addVisitWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    width: 400,
    height: 470,

  });
  addVisitWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "html/addVisitWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  addVisitWindow.once('ready-to-show', () => {
    if (visit != null) addVisitWindow.webContents.send("visit:edit", visit)
    addVisitWindow.webContents.send("selected:send", doc);
    addVisitWindow.show()
  })
  addVisitWindow.on("close", (evt) => {
    evt.preventDefault();
    addVisitWindow.hide();
    addVisitWindow = null;
  });
});

ipcMain.on("visit:added", (e, doc) => {
  mainWindow.webContents.send("visit:add", doc);
  addVisitWindow.close();
})