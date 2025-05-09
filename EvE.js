// Import required modules
const { StartChessEngine } = require("./game/engine/engine");
const botVsBot = require('./modules/botVsBot');

// Start the chess engine
StartChessEngine();

// Initialize bot vs bot mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const boardEl = document.getElementById('chessboard');
    if (boardEl) {
        const game = botVsBot.initBotVsBot(boardEl);

        // Expose toggle function for UI controls if needed
        window.toggleAutoPlay = game.toggleAutoPlay;
        window.resetChessGame = game.resetGame;
    }
});