// Import required modules
const { StartChessEngine } = require("./game/engine/engine");
const playerVsAI = require('./modules/playerVsAI');

// Start the chess engine
StartChessEngine();

// Initialize player vs AI mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const boardEl = document.getElementById('chessboard');
    if (boardEl) {
        const playerColor = parseInt(localStorage.getItem('playerColor') || '0');
        playerVsAI.initPlayerVsAI(boardEl, playerColor);
    }
});