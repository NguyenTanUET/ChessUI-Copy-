const { spawn } = require('child_process');
const path = require('path');

// Create and initialize chess engine process
function createChessEngine(engineName = 'CSEngine.exe') {
    const enginePath = path.join(__dirname, '..', engineName);
    const engine = spawn(enginePath);

    // Set up logging
    engine.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`${engineName} output:`, output);
    });

    return engine;
}

// Send command to engine
function sendCommand(engine, command) {
    engine.stdin.write(command + '\n');
}

// Get move from engine
function getMoveFromEngine(engine, moveHistory, depth = 5) {
    const positionCommand = 'position startpos moves ' + moveHistory
        .map(move => move.trim())
        .join(' ');

    sendCommand(engine, positionCommand);
    sendCommand(engine, `go depth ${depth}`);
    console.log(positionCommand);
}

module.exports = {
    createChessEngine,
    sendCommand,
    getMoveFromEngine
};