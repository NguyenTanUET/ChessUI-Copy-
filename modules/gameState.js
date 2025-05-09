
const { NewGame, FENStart, PrintGameState } = require("../game/engine/game");
const { GenerateMoves } = require("../game/moves/movegen");
const { ExecuteMove } = require("../game/moves/execute_move");
const { CheckEndGame, DisplayGameResult } = require("./match");

// Game state initialization
function initializeGame() {
    return {
        ...NewGame(FENStart),
        EnPassantSquare: -1,
        CastlingRight: 0b1111, // Full castling rights
        HalfMoves: 0,
        FullMoves: 1,
        PastPositions: [0n], // Initialize Zobrist hash array
        PinnedBoards: [0n, 0n], // Pinned pieces for both sides
        SideToMove: 0
    };
}

// Game state checking
function checkGameEnd(gameState) {
    const legalMoves = GenerateMoves(gameState);
    console.log(`Checking end game - Legal moves count: ${legalMoves.count}`);
    const endGameCode = CheckEndGame(gameState, legalMoves);
    console.log(`End game code: ${endGameCode}`);
    return DisplayGameResult(endGameCode, gameState.SideToMove);
}

// Export the game state module
module.exports = {
    initializeGame,
    checkGameEnd,
    PrintGameState
};