const electron = require("electron");
const url = require("url");
const path = require("path");
// const bootstrap = require("bootstrap");

var PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const { webContents } = require("electron")
const { app, BrowserWindow, Menu, ipcMain } = electron;

process.env.NODE_ENV = "production";


let mainWindow;
let addPatientWindow;
// let editPatientWindow;
let addVisitWindow;
let selection;
// var count;

let db = new PouchDB("patients");;
db.createIndex({
  index: { fields: ['name'] }
})

function getDocs() {

  db.find({
    selector: {
      name: { $gte: null }
    },
    sort: ['name'],
  }).then(result => {
    return result
  })
}
// let visitDB;
// let selected;

app.whenReady().then(() => {
  // console.log('marwan')
  // db = 
  // visitDB = new PouchDB("visits")

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 800,
    minHeight: 500,
    // icon : "assets\icons\win\icon.ico",
    // Menu: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true
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

  mainWindow.webContents.on('did-finish-load', () => {
    // win.webContents.send('table:add', )
    sendPatients();

    mainWindow.show();
  })

  // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Menu.setApplicationMenu(mainMenu);

  mainWindow.on("close", () => {
    mainWindow = null;
  });
});


function sendPatients() {
  db.find({
    selector: {
      name: { $gte: null }
    },
    sort: ['name'],
  }).then(result => {
    rows = result.docs
    rows.forEach(row => {
      mainWindow.webContents.send("table:add", row);
      // mainWindow.blur();
      // console.log("doc");

      if (selection == null) selection = 0
      mainWindow.webContents.send("db:send", result, (selection + 1));
    })
  })
  // rows = getDocs()
  // console.log(rows)
  // rows.sort(function (a, b) {
  //   var x = a.doc.name.toLowerCase();
  //   var y = b.doc.name.toLowerCase();
  //   if (x < y) { return -1; }
  //   if (x > y) { return 1; }
  //   return 0;
  // });
  // console.log('MARWAN')
  // console.log(result.rows);
  // rows.forEach(row => {
  //   mainWindow.webContents.send("table:add", row);
  //   // mainWindow.blur();
  //   // console.log("doc");

  //   if (selection == null) selection = 0
  //   mainWindow.webContents.send("db:send", result, (selection + 1));
  // })
}

ipcMain.on("patient:add", (e, patient, doc) => {
  addPatientWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    resizable: false,
    // radii: [5,5,5,5],
    // transparent: true,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    // useContentSize: true,
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
    // db.find({
    //   selector: {
    //     name: { $gte: null }
    //   },
    //   sort: ['name'],
    // }).then(result => {
      if (doc != null) {
        selection = patient
        // doc = result.docs[patient];
        // console.log(patient)
        // console.log(doc)
        addPatientWindow.webContents.send("patient:edit", doc)
      }
      // else {
      //   console.log([1,2].length)
      //   count = (result.docs).length;
      // }
    // })
    // db.allDocs({
    //   include_docs: true,
    //   attachments: true
    // }).then(function (result) {
    //   doc = result.rows[patient];
    //   console.log(patient)
    //   console.log(doc)
    //   addPatientWindow.webContents.send("patient:edit", doc)
    // })
    addPatientWindow.show()
  })
  // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Menu.setApplicationMenu(mainMenu);
  // addPatientWindow.setMenu(null);
  addPatientWindow.on("close", (evt) => {
    evt.preventDefault();    // This will cancel the close
    addPatientWindow.hide();
    addPatientWindow = null;
  });
});



ipcMain.on("visit:delete", (e, patient, index) => {
  try {
    selection = patient
    // console.log(selection)
    db.find({
      selector: {
        name: { $gte: null }
      },
      sort: ['name'],
    }).then(result => {
      var rows = result.docs
      // rows.sort(function (a, b) {
      //   var x = a.doc.name.toLowerCase();
      //   var y = b.doc.name.toLowerCase();
      //   if (x < y) { return -1; }
      //   if (x > y) { return 1; }
      //   return 0;
      // });
      // console.log('MARWAN')
      // console.log(result.rows[patient]);
      rows[patient].visits.splice(index, 1);
      db.put(rows[patient], function (err, response) {
        if (err) {
          // alert("Duplicate phone number");
          return console.log(err);
        } else {
          // console.log(doc);
          // mainWindow.webContents.send("visitList:add", visit);
          // mainWindow.reload()
        }
      });
    })
    mainWindow.reload();
  } catch (error) { }
})

ipcMain.on("patient:delete", (e, patient, toDelete) => {
  // console.log('hello')
  try {
    db.get(patient._id).then(function (doc) {
      return db.remove(doc);
      // console.log(doc)
    });
    mainWindow.reload();
  } catch (error) { }
});



// getDocs()

ipcMain.on("visit:add", (e, selected, doc, visit) => {
  selection = selected
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
    if(visit!=null) addVisitWindow.webContents.send("visit:edit", visit)
    // db.find({
    //   selector: {
    //     name: { $gte: null }
    //   },
    //   sort: ['name'],
    // }).then(result => {
    //   doc = result.docs[selected];
      // console.log(selected)
      addVisitWindow.webContents.send("selected:send", doc);
      // console.log(result.rows[index].doc);
    // });
    // addVisitWindow.webContents.send("selected:send", )
    addVisitWindow.show()
  })
  addVisitWindow.on("close", (evt) => {
    evt.preventDefault();    // This will cancel the close
    addVisitWindow.hide();
    addVisitWindow = null;
  });
});

ipcMain.on("patient:added", function (e, doc, newPatient) {
  // console.log("added")

  db.put(doc, function (err, response) {
    if (err) {
      alert("Duplicate phone number");
      return console.log(err);
    } else {
      // console.log(doc);
      // mainWindow.webContents.send("table:add", doc);
      if (newPatient) {
        // count = 0
        db.find({
          selector: {
            name: { $gte: null }
          },
          sort: ['name'],
        }).then(result => {
          result.docs.forEach(row => {
            // console.log(newPatient)

            if (row._id == doc._id) selection = result.docs.indexOf(row)
          });
          // selection = result.docs.indexOf(doc)
          console.log(selection)
        })
      }
      mainWindow.reload()
    }
  });
  // db.allDocs({
  //   include_docs: true,
  //   attachments: true
  // })
  //   .then((result) => {
  //     // console.log("haha")
  //     mainWindow.webContents.send("db:send", result);
  //   })
  addPatientWindow.close();
});

ipcMain.on("visit:added", (e, doc, visit) => {
  // console.log(doc)
  db.put(doc, function (err, response) {
    if (err) {
      // alert("Duplicate phone number");
      return console.log(err);
    } else {
      // console.log(doc);
      // mainWindow.webContents.send("visitList:add", visit);
      mainWindow.reload()
    }
  });
  // db.allDocs({
  //   include_docs: true,
  //   attachments: true
  // })
  //   .then((result) => {
  //     // console.log("haha")
  //     mainWindow.webContents.send("db:send", result);
  //   })
  addVisitWindow.close();
})

// ipcMain.on("patient:select", (e, index) => {
//   patientDB.allDocs({
//     include_docs: true,
//     attachments: true
//   }).then(function (result) {
//     try {
//       selected = result.rows[index].doc;
//       mainWindow.webContents.send("send:doc", selected);
//     } catch (error) { }
//     // console.log(result.rows[index].doc);
//   });
// })