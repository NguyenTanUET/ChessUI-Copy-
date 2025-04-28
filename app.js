const { NewGame, FENStart }      = require("./game/engine/game");
const { GenerateMoves }          = require("./game/moves/movegen");
const { GenMoveString, MakeMove, GetMoveFlag, MoveFlags} = require("./game/moves/move");
const { StartChessEngine }       = require("./game/engine/engine");
const { ExecuteMove }            = require("./game/moves/execute_move");
const { AlgebraicToMove }        = require("./game/bitboard/conversions");
const { PrintGameState }            = require("./game/engine/game");
const { spawn }                  = require('child_process');
const path                       = require('path');

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
console.log(moveList);

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
        sq.classList.add('square', (r + c) % 2 === 0 ? 'white' : 'black');
        const pos = files[c] + ranks[r];
        sq.dataset.pos = pos;
        if (pieces[r]) {
            sq.textContent = pieces[r][c];
        }
        boardEl.appendChild(sq);
    }
}

const squares = document.querySelectorAll('.square');
let selectedPos = null;

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

function movePiece(fromPos, toPos) {
    if (game.GameState.SideToMove !== 0) {
        console.log('Not white\'s turn yet!');
        return;
    }

    const fromSq = document.querySelector(`.square[data-pos="${fromPos}"]`);
    const toSq = document.querySelector(`.square[data-pos="${toPos}"]`);

    if (!fromSq || !toSq) return;

    // Check if this could be a pawn promotion (white pawn reaching 8th rank)
    console.log('Player fromSq.textContent:' + fromSq.textContent);
    console.log('is Player controlling a pawn:' + (fromSq.textContent === '♙'));

    // Fixed here - use the correct white pawn character (♙)
    const isPotentialPromotion = fromSq.textContent === '♙' && toPos.charAt(1) === '8';

    // If it's a potential promotion, show options to the player
    if (isPotentialPromotion) {
        showPromotionOptions(fromPos, toPos);
        return;
    }

    // For normal moves
    const move = fromPos + toPos;
    moveHistory.push(move);

    let moveConverted = AlgebraicToMove(move, GenerateMoves(game.GameState));

    // Check for en passant capture
    const moveFlag = GetMoveFlag(moveConverted);
    const isEnPassant = moveFlag === MoveFlags.ep_capture;

    // Determine captured pawn position for en passant
    let capturedPawnPos = null;
    if (isEnPassant) {
        // For white capturing black pawn (moving up)
        if (fromPos.charAt(1) === '5' && toPos.charAt(1) === '6') {
            capturedPawnPos = toPos.charAt(0) + '5'; // Black pawn is on rank 5
        }
    }

    // Save the piece before executing the move
    const pieceToBeMoved = fromSq.textContent;

    // Update game state
    game.GameState = ExecuteMove(game.GameState, moveConverted);

    // Handle castling
    const isCastling = handleCastling(fromPos, toPos);

    if (!isCastling) {
        // Normal move
        toSq.textContent = pieceToBeMoved;
        fromSq.textContent = '';

        // Remove captured pawn in en passant
        if (isEnPassant && capturedPawnPos) {
            const capturedPawnSq = document.querySelector(`.square[data-pos="${capturedPawnPos}"]`);
            if (capturedPawnSq) {
                capturedPawnSq.textContent = '';
            }
        }
    }

    PrintGameState(game.GameState);

    // Reset selection and highlight
    selectedPos = null;
    clearHighlights();

    // After player's move, call AI
    getAIMove();
}




// Add a promotion dialog function
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

    // Add promotion options (for white pieces)
    const pieces = [
        { type: 'q', symbol: '♕', name: 'Queen' },   // White Queen
        { type: 'r', symbol: '♖', name: 'Rook' },    // White Rook
        { type: 'b', symbol: '♗', name: 'Bishop' },  // White Bishop
        { type: 'n', symbol: '♘', name: 'Knight' }   // White Knight
    ];

    pieces.forEach(piece => {
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

            // Update the board visually
            const fromSq = document.querySelector(`.square[data-pos="${fromPos}"]`);
            const toSq = document.querySelector(`.square[data-pos="${toPos}"]`);

            if (fromSq && toSq) {
                toSq.textContent = piece.symbol;
                fromSq.textContent = '';
            }

            PrintGameState(game.GameState);

            // Reset selection and highlight
            selectedPos = null;
            clearHighlights();

            // After player's move, call AI
            getAIMove();
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



// Thực hiện nước đi của AI
function executeAIMove(move) {
    console.log('Bot moves:', move);
    console.log('Bot moves: length:', move.length); // Debug log
    
    // Trim any whitespace from the move string
    move = move.trim();
    
    // Extract positions and promotion info
    const fromPos = move.substring(0, 2);
    const toPos = move.substring(2, 4);
    const promotionPiece = move.length > 4 ? move.charAt(4) : null;
    
    // Get the DOM elements
    const fromSq = document.querySelector(`.square[data-pos="${fromPos}"]`);
    const toSq = document.querySelector(`.square[data-pos="${toPos}"]`);
    
    if (!fromSq || !toSq) {
        console.error('Could not find squares:', fromPos, toPos);
        return;
    }

    // Cập nhật lịch sử nước đi
    const moveToRecord = promotionPiece ? fromPos + toPos + promotionPiece : fromPos + toPos;
    moveHistory.push(moveToRecord);
    
    // Convert the move to internal format
    let convertedMove = AlgebraicToMove(moveToRecord, GenerateMoves(game.GameState));
    const moveFlag = GetMoveFlag(convertedMove);
    
    // Check if this is an en passant capture
    const isEnPassant = moveFlag === MoveFlags.ep_capture;
    
    // Determine captured pawn position for en passant
    let capturedPawnPos = null;
    if (isEnPassant) {
        // For black capturing white pawn (moving down)
        if (fromPos.charAt(1) === '4' && toPos.charAt(1) === '3') {
            capturedPawnPos = toPos.charAt(0) + '4'; // White pawn is on rank 4
        }
        // For white capturing black pawn (moving up)
        else if (fromPos.charAt(1) === '5' && toPos.charAt(1) === '6') {
            capturedPawnPos = toPos.charAt(0) + '5'; // Black pawn is on rank 5
        }
    }
    
    // Save the piece character before executing the move
    const pieceToBeMoved = fromSq.textContent;
    
    // Update game state
    game.GameState = ExecuteMove(game.GameState, convertedMove);
    
    // Xử lý castling
    const isCastling = handleCastling(fromPos, toPos);
    
    if (!isCastling) {
        if (promotionPiece) {
            // This is a promotion move
            let promotedPieceChar;
            
            // For black promoting (since AI is playing as black)
            switch (promotionPiece) {
                case 'q':
                    promotedPieceChar = '♛'; // Black queen
                    break;
                case 'r':
                    promotedPieceChar = '♜'; // Black rook
                    break;
                case 'b':
                    promotedPieceChar = '♝'; // Black bishop
                    break;
                case 'n':
                    promotedPieceChar = '♞'; // Black knight
                    break;
                default:
                    promotedPieceChar = '♛'; // Default to black queen
            }
            
            // Update the board visually
            toSq.textContent = promotedPieceChar;
            fromSq.textContent = '';
        } else {
            // Normal move - simply move the piece
            toSq.textContent = pieceToBeMoved;
            fromSq.textContent = '';
        }
        
        // Remove captured pawn in en passant
        if (isEnPassant && capturedPawnPos) {
            const capturedPawnSq = document.querySelector(`.square[data-pos="${capturedPawnPos}"]`);
            if (capturedPawnSq) {
                capturedPawnSq.textContent = '';
            }
        }
    }
    
    PrintGameState(game.GameState);
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
    if (game.GameState.SideToMove !== 1) {
        console.log('Not black\'s turn yet!');
        return;
    }
    const positionCommand = 'position startpos moves ' + moveHistory
        .map(move => move.trim())  // Remove any leading/trailing whitespace
        .join(' ');
    sendCommand(positionCommand);
    sendCommand('go depth 5');
    console.log(positionCommand);
}