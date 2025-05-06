const { NewGame, FENStart }      = require("./game/engine/game");
const { GenerateMoves }          = require("./game/moves/movegen");
const { GenMoveString, MakeMove, GetMoveFlag, MoveFlags} = require("./game/moves/move");
const { StartChessEngine }       = require("./game/engine/engine");
const { ExecuteMove }            = require("./game/moves/execute_move");
const { AlgebraicToMove }        = require("./game/bitboard/conversions");
const { PrintGameState }            = require("./game/engine/game");
const { spawn }                  = require('child_process');
const path                       = require('path');
const { CheckEndGame, DisplayGameResult } = require("./match"); // Adjust path as needed

StartChessEngine();

const playerColor = parseInt(localStorage.getItem('playerColor') || '0');
console.log("Người chơi chọn quân: " + (playerColor === 0 ? "Trắng" : "Đen"));

let game = {
    ...NewGame(FENStart),
    EnPassantSquare: -1,
    CastlingRight: 0b1111, // Full castling rights
    HalfMoves: 0,
    FullMoves: 1,
    PastPositions: [0n], // Khởi tạo mảng Zobrist hash
    PinnedBoards: [0n, 0n], // Pinned pieces cho 2 bên
    SideToMove: 0
};
let moveHistory = [];
let moveList = GenerateMoves(game.GameState);
console.log('Move list:' + game.GameState.LegalMoveList);
console.log('game.GameState.SideToMove: ' + game.GameState.SideToMove);

// Khởi tạo engine
const enginePath = path.join(__dirname, 'CSEngine.exe');
const engine = spawn(enginePath);

// Lắng nghe output từ engine
engine.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Engine output:', output);
    if (output.includes('bestmove')) {
        const bestMove = output.split('bestmove ')[1].split(' ')[0];
        executeAIMove(bestMove);
    }
});

// Hàm gửi lệnh đến engine
function sendCommand(command) {
    engine.stdin.write(command + '\n');
}


// Bảng ký tự quân cờ ở hàng 0,1,6,7
const pieces = {
    0: ['♜','♞','♝','♛','♚','♝','♞','♜'],
    1: Array(8).fill('♟'),
    6: Array(8).fill('♙'),
    7: ['♖','♘','♗','♕','♔','♗','♘','♖']
};

const files = ['a','b','c','d','e','f','g','h'];
const ranks = ['8','7','6','5','4','3','2','1'];



const boardEl = document.getElementById('chessboard');

// 1. Khởi tạo bàn cờ
for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        sq.classList.add('square', (r + c) % 2 === 0? 'white' : 'black');
        let rc = r
        let cc = c
        if (playerColor === 1) {
            rc = 7 - r;
            cc = 7 - c;
        }
        const pos = files[cc] + ranks[rc];
        // sq.dataset.pos = String(64 - Number(pos));
        sq.dataset.pos = (pos);
        if (pieces[r]) {
            sq.textContent = pieces[rc][cc];
        }
        boardEl.appendChild(sq);
    }
}
// Add this after the board is created

console.log('game.GameState.SideToMove: ' + game.GameState.SideToMove);
if (playerColor === 1) {
    console.log('bot called');
    getAIMove();
}
const squares = document.querySelectorAll('.square');
let selectedPos = null;
setupPiecesSystem();

// 2. Xóa highlight cũ
function clearHighlights() {
    squares.forEach(sq => sq.classList.remove('highlight'));
}

// 3. Hiển thị highlight các nước đi
function showHighlights(pos) {
    clearHighlights();
    const moves = getPossibleMoves(pos);
    moves.forEach(to => {
        const target = document.querySelector(`.square[data-pos="${to}"]`);
        if (target) target.classList.add('highlight');
    });
}

// Modify movePiece function to use animation
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
        showPromotionOptions(fromPos, toPos);
        return;
    }

    // For normal moves
    const move = fromPos + toPos;
    moveHistory.push(move);

    let moveConverted = AlgebraicToMove(move, GenerateMoves(game.GameState));
    const moveFlag = GetMoveFlag(moveConverted);

    // Check if this is castling
    const isCastling = (moveFlag === MoveFlags.king_castle || moveFlag === MoveFlags.queen_castle);

    // Save game state before animation
    const currentGameState = structuredClone(game.GameState);

    // Update game state
    game.GameState = ExecuteMove(game.GameState, moveConverted);

    // Animate the move
    if (isCastling) {
        animateCastling(fromPos, toPos, () => {
            afterMoveComplete();
        });
    } else {
        // Handle en passant capture
        if (moveFlag === MoveFlags.ep_capture) {
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

        animatePieceMove(fromPos, toPos, () => {
            afterMoveComplete();
        });
    }

    function afterMoveComplete() {
        PrintGameState(game.GameState);

        // Reset selection and highlight
        selectedPos = null;
        clearHighlights();

        // Check for game end
        const legalMoves = GenerateMoves(game.GameState);
        console.log(`Checking end game - Legal moves count: ${legalMoves.count}`);
        const endGameCode = CheckEndGame(game.GameState, legalMoves);
        console.log(`End game code: ${endGameCode}`);
        const gameResult = DisplayGameResult(endGameCode, game.GameState.SideToMove);
        console.log(`Game result: ${JSON.stringify(gameResult)}`);

        if (gameResult.isGameOver) {
            console.log("Game is over! Showing result...");
            showGameResult(gameResult);
            return;
        }

        // Call AI move if game not over
        getAIMove();
    }
}

// Function to reset the board UI
// Function to reset the board UI
function resetBoard() {
    console.log("Resetting the board UI");

    // First clear all squares
    squares.forEach(sq => {
        sq.textContent = '';
        // Ensure each square still has the chess-square class
        sq.classList.add('chess-square');
    });

    // Clear any existing pieces
    const existingPieces = document.querySelectorAll('.chess-piece');
    existingPieces.forEach(piece => piece.remove());

    // Now add pieces based on initial positions
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let rc = r;
            let cc = c;
            if (playerColor === 1) {
                rc = 7 - r;
                cc = 7 - c;
            }

            // Get position string
            const pos = files[cc] + ranks[rc];

            // Get square element
            const square = document.querySelector(`.square[data-pos="${pos}"]`);

            // If this position should have a piece in the initial setup
            if (pieces[r] && pieces[r][c]) {
                createPiece(pieces[rc][cc], pos);
            }
        }
    }

    console.log("Board UI reset complete");
}






// Replace your existing showPromotionOptions function with this one
function showPromotionOptions(fromPos, toPos) {
    // Create promotion dialog if it doesn't exist
    let promotionDialog = document.getElementById('promotion-dialog');
    if (!promotionDialog) {
        promotionDialog = document.createElement('div');
        promotionDialog.id = 'promotion-dialog';
        promotionDialog.style.position = 'fixed';
        promotionDialog.style.top = '50%';
        promotionDialog.style.left = '50%';
        promotionDialog.style.transform = 'translate(-50%, -50%)';
        promotionDialog.style.background = 'white';
        promotionDialog.style.border = '2px solid black';
        promotionDialog.style.padding = '20px';
        promotionDialog.style.zIndex = '1000';
        promotionDialog.style.display = 'flex';
        promotionDialog.style.flexDirection = 'row';
        promotionDialog.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
        document.body.appendChild(promotionDialog);
    } else {
        promotionDialog.innerHTML = ''; // Clear existing content
        promotionDialog.style.display = 'flex'; // Make visible
    }

    let promotionPieces = [];
    if (playerColor === 0) {
        promotionPieces = [
            { type: 'q', symbol: '♕', name: 'Queen' },
            { type: 'r', symbol: '♖', name: 'Rook' },
            { type: 'b', symbol: '♗', name: 'Bishop' },
            { type: 'n', symbol: '♘', name: 'Knight' }
        ];
    } else {
        promotionPieces = [
            { type: 'q', symbol: '♛', name: 'Queen' },
            { type: 'r', symbol: '♜', name: 'Rook' },
            { type: 'b', symbol: '♝', name: 'Bishop' },
            { type: 'n', symbol: '♞', name: 'Knight' }
        ];
    }

    promotionPieces.forEach(piece => {
        const pieceElement = document.createElement('div');
        pieceElement.style.width = '60px';
        pieceElement.style.height = '60px';
        pieceElement.style.fontSize = '40px';
        pieceElement.style.display = 'flex';
        pieceElement.style.justifyContent = 'center';
        pieceElement.style.alignItems = 'center';
        pieceElement.style.margin = '5px';
        pieceElement.style.cursor = 'pointer';
        pieceElement.style.background = '#e6e6e6';
        pieceElement.style.borderRadius = '5px';
        pieceElement.textContent = piece.symbol;
        pieceElement.title = piece.name;

        pieceElement.addEventListener('click', () => {
            // Hide dialog
            promotionDialog.style.display = 'none';

            // Execute the promotion move with the selected piece
            const move = fromPos + toPos + piece.type;
            moveHistory.push(move);

            // Convert the move to internal format
            let moveConverted = AlgebraicToMove(move, GenerateMoves(game.GameState));

            // Execute the move in the engine
            game.GameState = ExecuteMove(game.GameState, moveConverted);

            // Animate the pawn moving first
            animatePieceMove(fromPos, toPos, () => {
                // Then replace with promoted piece
                const toSquare = document.querySelector(`.square[data-pos="${toPos}"]`);
                const pawnElement = toSquare.querySelector('.chess-piece');

                if (pawnElement) {
                    // Scale animation for promotion
                    pawnElement.style.transition = 'transform 0.3s ease';
                    pawnElement.style.transform = 'scale(0.5)';

                    setTimeout(() => {
                        pawnElement.textContent = piece.symbol;
                        pawnElement.dataset.symbol = piece.symbol;
                        pawnElement.style.transform = 'scale(1)';

                        // After promotion animation
                        PrintGameState(game.GameState);

                        // Reset selection and highlight
                        selectedPos = null;
                        clearHighlights();

                        // Check for game end
                        const legalMoves = GenerateMoves(game.GameState);
                        console.log(`Checking end game - Legal moves count: ${legalMoves.count}`);
                        const endGameCode = CheckEndGame(game.GameState, legalMoves);
                        console.log(`End game code: ${endGameCode}`);
                        const gameResult = DisplayGameResult(endGameCode, game.GameState.SideToMove);
                        console.log(`Game result: ${JSON.stringify(gameResult)}`);

                        if (gameResult.isGameOver) {
                            console.log("Game is over! Showing result...");
                            showGameResult(gameResult);
                            return;
                        }

                        // After player's move, call AI
                        getAIMove();
                    }, 700);
                } else {
                    // If pawn element disappeared for some reason
                    PrintGameState(game.GameState);
                    selectedPos = null;
                    clearHighlights();
                    getAIMove();
                }
            });
        });

        pieceElement.addEventListener('mouseover', () => {
            pieceElement.style.background = '#c0c0c0';
        });

        pieceElement.addEventListener('mouseout', () => {
            pieceElement.style.background = '#e6e6e6';
        });

        promotionDialog.appendChild(pieceElement);
    });
}


// Replace your existing executeAIMove function with this one
function executeAIMove(move) {
    console.log('Bot moves:', move);
    console.log('Bot moves: length:', move.length);

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

    // Convert the move to internal format
    let convertedMove = AlgebraicToMove(moveToRecord, GenerateMoves(game.GameState));
    const moveFlag = GetMoveFlag(convertedMove);

    // Check if this is castling
    const isCastling = (moveFlag === MoveFlags.king_castle || moveFlag === MoveFlags.queen_castle);

    // Update game state
    game.GameState = ExecuteMove(game.GameState, convertedMove);

    // Animate the move based on its type
    if (isCastling) {
        animateCastling(fromPos, toPos, () => {
            afterMoveComplete();
        });
    } else if (promotionPiece) {
        // For promotion, first move the pawn
        animatePieceMove(fromPos, toPos, () => {
            // Then replace it with the promoted piece
            const toSquare = document.querySelector(`.square[data-pos="${toPos}"]`);
            const pawnElement = toSquare.querySelector('.chess-piece');

            if (pawnElement) {
                let promotedPieceChar;
                if (playerColor === 0) {
                    // For black AI promoting
                    switch (promotionPiece) {
                        case 'q': promotedPieceChar = '♛'; break;
                        case 'r': promotedPieceChar = '♜'; break;
                        case 'b': promotedPieceChar = '♝'; break;
                        case 'n': promotedPieceChar = '♞'; break;
                        default: promotedPieceChar = '♛'; break;
                    }
                } else {
                    // For white AI promoting
                    switch (promotionPiece) {
                        case 'q': promotedPieceChar = '♕'; break;
                        case 'r': promotedPieceChar = '♖'; break;
                        case 'b': promotedPieceChar = '♗'; break;
                        case 'n': promotedPieceChar = '♘'; break;
                        default: promotedPieceChar = '♕'; break;
                    }
                }

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
        if (moveFlag === MoveFlags.ep_capture) {
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
        animatePieceMove(fromPos, toPos, () => {
            afterMoveComplete();
        });
    }

    function afterMoveComplete() {
        PrintGameState(game.GameState);

        // Check for game end
        const legalMoves = GenerateMoves(game.GameState);
        console.log(`Checking end game - Legal moves count: ${legalMoves.count}`);
        const endGameCode = CheckEndGame(game.GameState, legalMoves);
        console.log(`End game code: ${endGameCode}`);
        const gameResult = DisplayGameResult(endGameCode, game.GameState.SideToMove);
        console.log(`Game result: ${JSON.stringify(gameResult)}`);

        if (gameResult.isGameOver) {
            console.log("Game is over! Showing result...");
            showGameResult(gameResult);
        }
    }
}

// Add this function to your app.js
function showGameResult(gameResult) {
    console.log("Showing game result:", gameResult);

    // Create modal container if it doesn't exist
    let resultModal = document.getElementById('game-result-modal');
    if (!resultModal) {
        resultModal = document.createElement('div');
        resultModal.id = 'game-result-modal';

        // Style the modal
        resultModal.style.position = 'fixed';
        resultModal.style.top = '0';
        resultModal.style.left = '0';
        resultModal.style.width = '100%';
        resultModal.style.height = '100%';
        resultModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        resultModal.style.display = 'flex';
        resultModal.style.justifyContent = 'center';
        resultModal.style.alignItems = 'center';
        resultModal.style.zIndex = '1000';

        document.body.appendChild(resultModal);
    } else {
        // Make sure it's visible
        resultModal.style.display = 'flex';
    }

    // Create or update modal content
    resultModal.innerHTML = `
        <div style="background-color: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px;">
            <h2 style="margin-top: 0; color: #333;">${gameResult.message}</h2>
            <p style="font-size: 18px; margin: 15px 0;">Kết quả: <strong>${gameResult.result}</strong></p>
            <button id="new-game-button" style="padding: 10px 20px; font-size: 16px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Ván mới</button>
        </div>
    `;

    // Add event listener to the new game button
    document.getElementById('new-game-button').addEventListener('click', () => {
        // Hide the modal
        resultModal.style.display = 'none';

        // Reset the game
        resetGame();
    });
}
// Function to reset the game
function resetGame() {
    // Reset game state
    game = {
        ...NewGame(FENStart),
        EnPassantSquare: -1,
        CastlingRight: 0b1111,
        HalfMoves: 0,
        FullMoves: 1,
        PastPositions: [0n],
        PinnedBoards: [0n, 0n],
        SideToMove: 0
    };
    moveHistory = [];
    moveList = GenerateMoves(game.GameState);

    // Reset the board
    resetBoard();

    console.log("Game has been reset");

    // If player is black, let AI make first move
    if (playerColor === 1) {
        getAIMove();
    }
}


// Hàm xử lý castling
function handleCastling(fromPos, toPos) {
    // Xác định nước đi castling
    const isWhiteKingside = (fromPos === 'e1' && toPos === 'g1');
    const isWhiteQueenside = (fromPos === 'e1' && toPos === 'c1');
    const isBlackKingside = (fromPos === 'e8' && toPos === 'g8');
    const isBlackQueenside = (fromPos === 'e8' && toPos === 'c8');

    if (isWhiteKingside) {
        // Di chuyển vua
        document.querySelector(`.square[data-pos="g1"]`).textContent = '♔';
        document.querySelector(`.square[data-pos="e1"]`).textContent = '';
        // Di chuyển xe
        document.querySelector(`.square[data-pos="f1"]`).textContent = '♖';
        document.querySelector(`.square[data-pos="h1"]`).textContent = '';
        return true;
    }
    else if (isWhiteQueenside) {
        // Di chuyển vua
        document.querySelector(`.square[data-pos="c1"]`).textContent = '♔';
        document.querySelector(`.square[data-pos="e1"]`).textContent = '';
        // Di chuyển xe
        document.querySelector(`.square[data-pos="d1"]`).textContent = '♖';
        document.querySelector(`.square[data-pos="a1"]`).textContent = '';
        return true;
    }
    else if (isBlackKingside) {
        // Di chuyển vua
        document.querySelector(`.square[data-pos="g8"]`).textContent = '♚';
        document.querySelector(`.square[data-pos="e8"]`).textContent = '';
        // Di chuyển xe
        document.querySelector(`.square[data-pos="f8"]`).textContent = '♜';
        document.querySelector(`.square[data-pos="h8"]`).textContent = '';
        return true;
    }
    else if (isBlackQueenside) {
        // Di chuyển vua
        document.querySelector(`.square[data-pos="c8"]`).textContent = '♚';
        document.querySelector(`.square[data-pos="e8"]`).textContent = '';
        // Di chuyển xe
        document.querySelector(`.square[data-pos="d8"]`).textContent = '♜';
        document.querySelector(`.square[data-pos="a8"]`).textContent = '';
        return true;
    }

    return false;
}

// Sửa phần xử lý click
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
            clearHighlights();
            return;
        }

        selectedPos = pos;
        showHighlights(pos);
    });
});

// Cập nhật hàm getPossibleMoves để lọc nước đi hợp lệ
function getPossibleMoves(fromPos) {
    // Lấy danh sách nước đi hợp lệ dựa trên trạng thái game hiện tại
    const list = GenerateMoves(game.GameState);
    const result = [];
    console.log('legal move: ' + game.GameState.LegalMoveList);

    for (let i = 0; i < list.count; i++) {
        const mv = GenMoveString(list.moves[i]);
        if (mv.startsWith(fromPos)) {
            result.push(mv.slice(2, 4));
        }
    }
    return result;
}

// Hàm gọi engine để lấy nước đi của đen
function getAIMove() {
    const positionCommand = 'position startpos moves ' + moveHistory
        .map(move => move.trim())  // Remove any leading/trailing whitespace
        .join(' ');
    sendCommand(positionCommand);
    sendCommand('go depth 5');
    console.log(positionCommand);
}

// Improved setupPiecesSystem for initial game start
function setupPiecesSystem() {
    console.log("Setting up piece system");

    // Clear any existing pieces
    const existingPieces = document.querySelectorAll('.chess-piece');
    existingPieces.forEach(piece => piece.remove());

    // Add chess-square class to all squares if needed
    squares.forEach(sq => {
        sq.classList.add('chess-square');

        // Get the current piece text if any
        const pieceText = sq.textContent.trim();

        // Clear the square text
        sq.textContent = '';

        // If there was a piece, create a piece element
        if (pieceText && pieceText !== '.') {
            createPiece(pieceText, sq.dataset.pos);
        }
    });

    console.log("Piece system setup complete");
}


// Function to create a piece element
function createPiece(symbol, position) {
    const pieceElement = document.createElement('div');
    pieceElement.className = 'chess-piece';
    pieceElement.textContent = symbol;
    pieceElement.dataset.symbol = symbol;
    pieceElement.dataset.position = position;

    // Make pieces larger and centered
    pieceElement.style.fontSize = '50px'; // Larger font size
    pieceElement.style.display = 'flex';
    pieceElement.style.justifyContent = 'center';
    pieceElement.style.alignItems = 'center';
    pieceElement.style.width = '90%'; // Use less than 100% to center in square
    pieceElement.style.height = '90%';
    pieceElement.style.margin = 'auto'; // Center in square

    // Find the square and place the piece in it
    const square = document.querySelector(`.square[data-pos="${position}"]`);
    if (square) {
        square.appendChild(pieceElement);
    }

    return pieceElement;
}

// Function to move a piece with animation
function animatePieceMove(fromPos, toPos, callback) {
    const fromSquare = document.querySelector(`.square[data-pos="${fromPos}"]`);
    const toSquare = document.querySelector(`.square[data-pos="${toPos}"]`);
    const pieceElement = fromSquare.querySelector('.chess-piece');

    if (!fromSquare || !toSquare || !pieceElement) {
        console.error('Missing elements for animation', fromPos, toPos);
        if (callback) callback();
        return;
    }

    // Check if there's a piece to capture
    const capturedPiece = toSquare.querySelector('.chess-piece');
    if (capturedPiece) {
        // Start the capture animation
        capturedPiece.style.zIndex = '5';
        capturedPiece.classList.add('captured');

        // Remove the captured piece after animation completes
        setTimeout(() => {
            capturedPiece.remove();
        }, 300);
    }

    // Get the positions for animation
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();

    // Create a clone for animation
    const clone = document.createElement('div');
    clone.className = 'piece-clone';
    clone.textContent = pieceElement.textContent;
    clone.dataset.symbol = pieceElement.dataset.symbol || pieceElement.textContent;

    // Position the clone exactly where the original piece is
    clone.style.position = 'fixed';
    clone.style.top = `${fromRect.top}px`;
    clone.style.left = `${fromRect.left}px`;
    clone.style.width = `${fromRect.width}px`;
    clone.style.height = `${fromRect.height}px`;
    clone.style.fontSize = '50px';
    clone.style.display = 'flex';
    clone.style.justifyContent = 'center';
    clone.style.alignItems = 'center';
    clone.style.zIndex = '1000';
    clone.style.transition = 'all 0.3s ease'; // Set duration in the element itself

    // Add the clone to the body
    document.body.appendChild(clone);

    // Remove the original piece
    pieceElement.remove();

    // Force a reflow to ensure the animation will work
    void clone.offsetWidth;

    // Set the target position
    setTimeout(() => {
        clone.style.top = `${toRect.top}px`;
        clone.style.left = `${toRect.left}px`;

        // After animation completes, place the actual piece and remove the clone
        setTimeout(() => {
            clone.remove();
            createPiece(clone.dataset.symbol, toPos);
            if (callback) callback();
        }, 350); // Slightly longer than the transition duration to ensure it completes
    }, 10);
}

// Function to handle castling animation
function animateCastling(kingFrom, kingTo, callback) {
    // Determine rook positions based on the castling type
    let rookFrom, rookTo;

    if (kingFrom === 'e1' && kingTo === 'g1') {
        // White kingside
        rookFrom = 'h1';
        rookTo = 'f1';
    } else if (kingFrom === 'e1' && kingTo === 'c1') {
        // White queenside
        rookFrom = 'a1';
        rookTo = 'd1';
    } else if (kingFrom === 'e8' && kingTo === 'g8') {
        // Black kingside
        rookFrom = 'h8';
        rookTo = 'f8';
    } else if (kingFrom === 'e8' && kingTo === 'c8') {
        // Black queenside
        rookFrom = 'a8';
        rookTo = 'd8';
    } else {
        // Not castling
        if (callback) callback();
        return;
    }

    // First animate the king
    animatePieceMove(kingFrom, kingTo, () => {
        // Then animate the rook
        animatePieceMove(rookFrom, rookTo, callback);
    });
}