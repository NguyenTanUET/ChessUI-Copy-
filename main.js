const { app, BrowserWindow } = require('electron');
const {NewGame, FENStart} = require("./game/engine/game");
const {GenerateMoves} = require("./game/moves/movegen");
const {GenMoveString} = require("./game/moves/move");
const {StartChessEngine} = require("./game/engine/engine");
const path = require('path');
function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
        //frame : false,
        //backgroundColor: "#ff0000", // mau do
        //alwaysOnTop : true ,  // luon giu vi tri dau
    });
    /* let child = new BrowserWindow({
       parent : win,
       width: 800,
       height: 600,
     });*/
    win.show();
    win.loadFile('chess.html'); // Tải file HTML
    //child.loadFile('child.html')
    win.webContents.openDevTools();
    console.warn("electron is running"); // In ra khi cửa sổ được tạo
}
app.whenReady().then(createWindow)



