const { StartChessEngine } = require("../game/engine/engine");
const gameState = require('./gameState');
const engineCommunication = require('./engineCommunication');
const boardSetup = require('./boardSetup');
const pieceMovement = require('./pieceMovement');
const promotionDialog = require('./promotionDialog');
const gameUI = require('./gameUI');

// Initialize the chess engine
StartChessEngine();

// Initialize the player vs AI game
function initPlayerVsAI(boardEl) {
    // Get player color from local storage
    const playerColor = parseInt(localStorage.getItem('playerColor') || '0');
    console.log("Player chosen color: " + (playerColor === 0 ? "White" : "Black"));

    // Initialize game state
    let game = gameState.initializeGame();
    let moveHistory = [];

    // Initialize the chess engine
    const engine = engineCommunication.createChessEngine();

    // Set up the engine's stdout handler for moves
    engine.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('bestmove')) {
            const bestMove = output.split('bestmove ')[1].split(' ')[0];
            executeAIMove(bestMove);
        }
    });

    // Initialize the board UI
    const squares = boardSetup.initializeBoard(boardEl, playerColor);
    boardSetup.setupPiecesSystem(squares);

    // Track selected position
    let selectedPos = null;

    // Start the game - call AI first if player is black
    if (playerColor === 1) {
        console.log('bot called');
        getAIMove();
    }

    // Set up click handlers for the squares
    setupBoardEventListeners();

    // Functions

    // Set up click event listeners for chess squares
    function setupBoardEventListeners() {
        squares.forEach(sq => {
            sq.addEventListener('click', () => {
                const pos = sq.dataset.pos;

                if (selectedPos && sq.classList.contains('highlight')) {
                    console.log('selectedPos: ' + selectedPos);
                    movePiece(selectedPos, pos);
                    return;
                }

                if (selectedPos === pos || !sq.textContent) {
                    selectedPos = null;
                    gameUI.clearHighlights();
                    return;
                }

                selectedPos = pos;
                const possibleMoves = pieceMovement.getPossibleMoves(game.GameState, pos);
                gameUI.showHighlights(possibleMoves, pos);
            });
        });
    }

    // Move a piece on the board
    function movePiece(fromPos, toPos) {
        // Check for pawn promotion
        const fromSq = document.querySelector(`.square[data-pos="${fromPos}"]`);
        const pieceElement = fromSq.querySelector('.chess-piece');

        if (!pieceElement) return;

        const pieceSymbol = pieceElement.textContent;

        // Check for promotion
        let isPotentialPromotion;
        if (playerColor === 1) {
            isPotentialPromotion = pieceSymbol === '♟' && toPos.charAt(1) === '1';
        } else {
            isPotentialPromotion = pieceSymbol === '♙' && toPos.charAt(1) === '8';
        }

        if (isPotentialPromotion) {
            promotionDialog.showPromotionOptions(fromPos, toPos, playerColor, (piece) => {
                handlePromotion(fromPos, toPos, piece.type);
            });
            return;
        }

        // For normal moves
        const move = fromPos + toPos;
        moveHistory.push(move);

        let moveConverted = pieceMovement.executeMove(game.GameState, move);
        const moveFlag = pieceMovement.GetMoveFlag(moveConverted);

        // Check if this is castling
        const isCastling = (moveFlag === pieceMovement.MoveFlags.king_castle ||
            moveFlag === pieceMovement.MoveFlags.queen_castle);

        // Save game state before animation
        game.GameState = pieceMovement.executeMove(game.GameState, move);

        // Animate the move
        if (isCastling) {
            pieceMovement.animateCastling(fromPos, toPos, () => {
                afterMoveComplete();
            });
        } else {
            // Handle en passant capture
            if (moveFlag === pieceMovement.MoveFlags.ep_capture) {
                const capturedPawnPos = toPos.charAt(0) + (playerColor === 0 ? '5' : '3');
                const capturedPawnSq = document.querySelector(`.square[data-pos="${capturedPawnPos}"]`);
                const capturedPawn = capturedPawnSq.querySelector('.chess-piece');

                if (capturedPawn) {
                    capturedPawn.classList.add('captured');
                    setTimeout(() => {
                        capturedPawn.remove();
                    }, 0);
                }
            }

            pieceMovement.animatePieceMove(fromPos, toPos, () => {
                afterMoveComplete();
            });
        }
    }

    // Handle promotion move
    function handlePromotion(fromPos, toPos, promotionPiece) {
        // Execute the promotion move with the selected piece
        const move = fromPos + toPos + promotionPiece;
        moveHistory.push(move);

        // Execute the move in the engine
        game.GameState = pieceMovement.executeMove(game.GameState, move);

        // Animate the pawn moving first
        pieceMovement.animatePieceMove(fromPos, toPos, () => {
            // Then replace with promoted piece
            const toSquare = document.querySelector(`.square[data-pos="${toPos}"]`);
            const pawnElement = toSquare.querySelector('.chess-piece');

            if (pawnElement) {
                // Scale animation for promotion
                pawnElement.style.transition = 'transform 0.3s ease';
                pawnElement.style.transform = 'scale(0.5)';

                setTimeout(() => {
                    const promotedPieceChar = promotionDialog.getPromotionChar(promotionPiece, playerColor);
                    pawnElement.textContent = promotedPieceChar;
                    pawnElement.dataset.symbol = promotedPieceChar;
                    pawnElement.style.transform = 'scale(1)';

                    // After promotion animation
                    gameState.PrintGameState(game.GameState);

                    // Reset selection and highlight
                    selectedPos = null;
                    gameUI.clearHighlights();

                    // Check for game end
                    const gameResult = gameState.checkGameEnd(game.GameState);

                    if (gameResult.isGameOver) {
                        console.log("Game is over! Showing result...");
                        gameUI.showGameResult(gameResult, resetGame);
                        return;
                    }

                    // After player's move, call AI
                    getAIMove();
                }, 700);
            } else {
                // If pawn element disappeared for some reason
                gameState.PrintGameState(game.GameState);
                selectedPos = null;
                gameUI.clearHighlights();
                getAIMove();
            }
        });
    }

    // After move completion
    function afterMoveComplete() {
        gameState.PrintGameState(game.GameState);

        // Reset selection and highlight
        selectedPos = null;
        gameUI.clearHighlights();

        // Check for game end
        const gameResult = gameState.checkGameEnd(game.GameState);

        if (gameResult.isGameOver) {
            console.log("Game is over! Showing result...");
            gameUI.showGameResult(gameResult, resetGame);
            return;
        }

        // Call AI move ONLY if it's the AI's turn (not the player's turn)
        // This is the key fix - only get AI move when it's not the player's turn
        if (game.GameState.SideToMove !== playerColor) {
            getAIMove();
        }
    }


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
                    const promotedPieceChar = promotionDialog.getPromotionChar(
                        promotionPiece,
                        playerColor === 0 ? 1 : 0 // opponent's color
                    );

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
                const capturedPawnPos = toPos.charAt(0) + (playerColor === 1 ? '5' : '3');
                const capturedPawnSq = document.querySelector(`.square[data-pos="${capturedPawnPos}"]`);
                const capturedPawn = capturedPawnSq ? capturedPawnSq.querySelector('.chess-piece') : null;

                if (capturedPawn) {
                    capturedPawn.classList.add('captured');
                    setTimeout(() => {
                        capturedPawn.remove();
                    }, 0);
                }
            }

            // For regular moves
            pieceMovement.animatePieceMove(fromPos, toPos, () => {
                afterMoveComplete();
            });
        }
    }

    // Get AI move
    function getAIMove() {
        const positionCommand = 'position startpos moves ' + moveHistory
            .map(move => move.trim())
            .join(' ');
        engineCommunication.sendCommand(engine, positionCommand);
        engineCommunication.sendCommand(engine, 'go depth 5');
        console.log(positionCommand);
    }

    // Reset the game
    function resetGame() {
        // Reset game state
        game = gameState.initializeGame();
        moveHistory = [];

        // Reset the board
        boardSetup.resetBoard(squares, playerColor);

        console.log("Game has been reset");

        // If player is black, let AI make first move
        if (playerColor === 1) {
            getAIMove();
        }
    }

    // Return public methods
    return {
        resetGame
    };
}

module.exports = {
    initPlayerVsAI
};