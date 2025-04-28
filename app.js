const { NewGame, FENStart }      = require("./game/engine/game");
const { GenerateMoves }          = require("./game/moves/movegen");
const { GenMoveString, MakeMove} = require("./game/moves/move");
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

// Cập nhật hàm movePiece đã có để hỗ trợ castling
function movePiece(fromPos, toPos) {
    if (game.GameState.SideToMove !== 0) {
        console.log('Not white\'s turn yet!');
        return;
    }

    const fromSq = document.querySelector(`.square[data-pos="${fromPos}"]`);
    const toSq = document.querySelector(`.square[data-pos="${toPos}"]`);

    if (!fromSq || !toSq) return;

    // Cập nhật lịch sử nước đi
    const move = fromPos + toPos;
    moveHistory.push(move);

    let moveConverted = AlgebraicToMove(move, GenerateMoves(game.GameState));

    // Cập nhật trạng thái game
    game.GameState = ExecuteMove(game.GameState, moveConverted);

    // Xử lý castling
    const isCastling = handleCastling(fromPos, toPos);

    if (!isCastling) {
        // Normal move
        toSq.textContent = fromSq.textContent;
        fromSq.textContent = '';
    }

    PrintGameState(game.GameState);

    // Reset selection và highlight
    selectedPos = null;
    clearHighlights();

    // Sau khi người chơi di chuyển, gọi bot
    getAIMove();
}


// Thực hiện nước đi của AI
// Thực hiện nước đi của AI
function executeAIMove(move) {
    console.log('Bot moves:', move);
    let convertedMove = AlgebraicToMove(move, GenerateMoves(game.GameState));
    // Get the from and to positions
    const fromPos = move.substring(0, 2);
    const toPos = move.substring(2, 4);

    // Update the DOM (visual board)
    const fromSq = document.querySelector(`.square[data-pos="${fromPos}"]`);
    const toSq = document.querySelector(`.square[data-pos="${toPos}"]`);

    if (!fromSq || !toSq) return;

    // Cập nhật trạng thái game trước khi cập nhật DOM
    moveHistory.push(move);
    game.GameState = ExecuteMove(game.GameState, convertedMove);

    // Xử lý castling
    const isCastling = handleCastling(fromPos, toPos);

    if (!isCastling) {
        // Normal move
        toSq.textContent = fromSq.textContent;
        fromSq.textContent = '';
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

