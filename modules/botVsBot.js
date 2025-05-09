const { StartChessEngine } = require("../game/engine/engine");
const gameState = require('./gameState');
const engineCommunication = require('./engineCommunication');
const boardSetup = require('./boardSetup');
const pieceMovement = require('./pieceMovement');
const promotionDialog = require('./promotionDialog');
const gameUI = require('./gameUI');

// Initialize the chess engine
StartChessEngine();

// Initialize the Bot vs Bot game
function initBotVsBot(boardEl) {
    // Initialize game state
    let game = gameState.initializeGame();
    let moveHistory = [];

    // Variables to control auto play
    let autoPlayMode = true;
    const moveDelay = 1000; // 1 second delay between moves
    let isMovePending = false;

    // Initialize the chess engines
    const whiteEngine = engineCommunication.createChessEngine('CSEngine.exe');
    const blackEngine = engineCommunication.createChessEngine('CSEngine2.exe');

    // Set up the engines' stdout handlers for moves
    whiteEngine.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('White engine output:', output);
        if (output.includes('bestmove') && game.GameState.SideToMove === 0) {
            const bestMove = output.split('bestmove ')[1].split(' ')[0];
            executeAIMove(bestMove);
        }
    });

    blackEngine.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Black engine output:', output);
        if (output.includes('bestmove') && game.GameState.SideToMove === 1) {
            const bestMove = output.split('bestmove ')[1].split(' ')[0];
            executeAIMove(bestMove);
        }
    });

    // Initialize the board UI
    const squares = boardSetup.initializeBoard(boardEl);
    boardSetup.setupPiecesSystem(squares);

    // Start the game
    getAIMove();

    // Functions

    // Execute AI move
    function executeAIMove(move) {
        console.log('Bot moves:', move);

        // Trim any whitespace from the move string
        move = move.trim();

        // Extract positions and promotion info
        const fromPos = move.substring(0, 2);
        const toPos = move.substring(2, 4);
        const promotionPiece = move.length > 4 ? move.charAt(4) : null;

        // Get the DOM elements
        const fromSq = document.querySelector(`.square[data-pos="${fromPos}"]`);
        const pieceElement = fromSq ? fromSq.querySelector('.chess-piece') : null;

        if (!fromSq || !pieceElement) {
            console.error('Could not find piece to move:', fromPos);
            return;
        }

        // Update move history
        const moveToRecord = promotionPiece ? fromPos + toPos + promotionPiece : fromPos + toPos;
        moveHistory.push(moveToRecord);

        // Execute the move in the game state
        game.GameState = pieceMovement.executeMove(game.GameState, moveToRecord);
        const moveFlag = pieceMovement.GetMoveFlag(moveToRecord);

        // Check if this is castling
        const isCastling = (moveFlag === pieceMovement.MoveFlags.king_castle ||
            moveFlag === pieceMovement.MoveFlags.queen_castle);

        // Animate the move based on its type
        if (isCastling) {
            pieceMovement.animateCastling(fromPos, toPos, () => {
                afterMoveComplete();
            });
        } else if (promotionPiece) {
            // For promotion, first move the pawn
            pieceMovement.animatePieceMove(fromPos, toPos, () => {
                // Then replace it with the promoted piece
                const toSquare = document.querySelector(`.square[data-pos="${toPos}"]`);
                const pawnElement = toSquare.querySelector('.chess-piece');

                if (pawnElement) {
                    // Determine which side just moved (opposite of current side to move)
                    const sideJustMoved = game.GameState.SideToMove === 0 ? 1 : 0;
                    const promotedPieceChar = promotionDialog.getPromotionChar(promotionPiece, sideJustMoved);

                    // Scale animation for promotion
                    pawnElement.style.transition = 'transform 0.3s ease';
                    pawnElement.style.transform = 'scale(0.5)';

                    setTimeout(() => {
                        pawnElement.textContent = promotedPieceChar;
                        pawnElement.dataset.symbol = promotedPieceChar;
                        pawnElement.style.transform = 'scale(1)';
                        afterMoveComplete();
                    }, 700);
                } else {
                    afterMoveComplete();
                }
            });
        } else {
            // Handle en passant capture
            if (moveFlag === pieceMovement.MoveFlags.ep_capture) {
                const capturedPawnRank = game.GameState.SideToMove === 0 ? '5' : '3';
                const capturedPawnPos = toPos.charAt(0) + capturedPawnRank;
                const capturedPawnSq = document.querySelector(`.square[data-pos="${capturedPawnPos}"]`);
                const capturedPawn = capturedPawnSq ? capturedPawnSq.querySelector('.chess-piece') : null;

                if (capturedPawn) {
                    capturedPawn.classList.add('captured');
                    setTimeout(() => {
                        capturedPawn.remove();
                    }, 150);
                }
            }

            // For regular moves
            pieceMovement.animatePieceMove(fromPos, toPos, () => {
                afterMoveComplete();
            });
        }
    }

    // After move completion
    function afterMoveComplete() {
        gameState.PrintGameState(game.GameState);

        // Check for game end
        const gameResult = gameState.checkGameEnd(game.GameState);

        if (gameResult.isGameOver) {
            console.log("Game is over! Showing result...");
            gameUI.showGameResult(gameResult, resetGame);
            return;
        }

        // If in auto play mode, get the next move
        if (autoPlayMode) {
            getAIMove();
        }
    }

    // Get AI move
    function getAIMove() {
        if (isMovePending) return; // If a move is pending, do nothing

        isMovePending = true;

        // Wait a moment before executing the next move
        setTimeout(() => {
            const positionCommand = 'position startpos moves ' + moveHistory
                .map(move => move.trim())
                .join(' ');

            if (game.GameState.SideToMove === 0) {
                // White's turn
                console.log('Getting move for WHITE');
                engineCommunication.sendCommand(whiteEngine, positionCommand);
                engineCommunication.sendCommand(whiteEngine, 'go depth 5');
            } else {
                // Black's turn
                console.log('Getting move for BLACK');
                engineCommunication.sendCommand(blackEngine, positionCommand);
                engineCommunication.sendCommand(blackEngine, 'go depth 5');
            }
            console.log(positionCommand);

            isMovePending = false;
        }, moveDelay);
    }

    // Reset the game for Bot vs Bot mode
    function resetGame() {
        // Reset game state
        game = gameState.initializeGame();
        moveHistory = [];

        // Reset the board
        boardSetup.resetBoard(squares);

        console.log("Game has been reset");

        // Start a new game in auto mode
        if (autoPlayMode) {
            getAIMove();
        }
    }

    // Return public methods
    return {
        resetGame,
        toggleAutoPlay: function(enable) {
            autoPlayMode = enable;
            if (autoPlayMode && !isMovePending) {
                getAIMove();
            }
        }
    };
}

module.exports = {
    initBotVsBot
};