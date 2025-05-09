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

// Biến kiểm soát chế độ người chơi
let autoPlayMode = true; // True để hai bot đánh với nhau
const moveDelay = 1000; // Thời gian trễ 1 giây giữa mỗi nước đi
let isMovePending = false; // Để ngăn các nước đi chồng chéo

// Khởi tạo engine cho quân trắng
const whiteEnginePath = path.join(__dirname, 'CSEngine.exe');
const whiteEngine = spawn(whiteEnginePath);

// Khởi tạo engine cho quân đen
const blackEnginePath = path.join(__dirname, 'CSEngine2.exe');
const blackEngine = spawn(blackEnginePath);


// Khởi tạo engine
const enginePath = path.join(__dirname, 'CSEngine.exe');
const engine = spawn(enginePath);

// Lắng nghe output từ engine trắng
whiteEngine.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('White engine output:', output);
    if (output.includes('bestmove') && game.GameState.SideToMove === 0) {
        const bestMove = output.split('bestmove ')[1].split(' ')[0];
        executeAIMove(bestMove);
    }
});

// Lắng nghe output từ engine đen
blackEngine.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Black engine output:', output);
    if (output.includes('bestmove') && game.GameState.SideToMove === 1) {
        const bestMove = output.split('bestmove ')[1].split(' ')[0];
        executeAIMove(bestMove);
    }
});

// Hàm gửi lệnh đến engine trắng
function sendCommandToWhiteEngine(command) {
    whiteEngine.stdin.write(command + '\n');
}

// Hàm gửi lệnh đến engine đen
function sendCommandToBlackEngine(command) {
    blackEngine.stdin.write(command + '\n');
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
getAIMove();

const squares = document.querySelectorAll('.square');
let selectedPos = null;
setupPiecesSystem();

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


// Cập nhật hàm executeAIMove để gọi getAIMove nếu đang trong chế độ tự động
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
                if (game.GameState.SideToMove === 0) { // Phía vừa đi là đen
                    // For black promoting
                    switch (promotionPiece) {
                        case 'q': promotedPieceChar = '♛'; break;
                        case 'r': promotedPieceChar = '♜'; break;
                        case 'b': promotedPieceChar = '♝'; break;
                        case 'n': promotedPieceChar = '♞'; break;
                        default: promotedPieceChar = '♛'; break;
                    }
                } else { // Phía vừa đi là trắng
                    // For white promoting
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
            return;
        }

        // Nếu trong chế độ tự động, tiếp tục lấy nước đi
        if (autoPlayMode) {
            getAIMove();
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

// Hàm reset game cho chế độ hai bot
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

    // Bắt đầu ván đấu mới trong chế độ auto
    if (autoPlayMode) {
        getAIMove();
    }
}



// Hàm gọi engine để lấy nước đi
function getAIMove() {
    if (isMovePending) return; // Nếu đang chờ một nước đi, không làm gì cả

    isMovePending = true;

    // Chờ 3 giây trước khi thực hiện nước đi tiếp theo
    setTimeout(() => {
        const positionCommand = 'position startpos moves ' + moveHistory
            .map(move => move.trim())
            .join(' ');

        if (game.GameState.SideToMove === 0) {
            // Quân trắng đi
            console.log('Getting move for WHITE');
            sendCommandToWhiteEngine(positionCommand);
            sendCommandToWhiteEngine('go depth 5');
        } else {
            // Quân đen đi
            console.log('Getting move for BLACK');
            sendCommandToBlackEngine(positionCommand);
            sendCommandToBlackEngine('go depth 5');
        }
        console.log(positionCommand);

        isMovePending = false;
    }, moveDelay);
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
        }, 150);
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