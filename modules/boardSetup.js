// Piece initialization data
const initialPieces = {
    0: ['♜','♞','♝','♛','♚','♝','♞','♜'],
    1: Array(8).fill('♟'),
    6: Array(8).fill('♙'),
    7: ['♖','♘','♗','♕','♔','♗','♘','♖']
};

const files = ['a','b','c','d','e','f','g','h'];
const ranks = ['8','7','6','5','4','3','2','1'];

// Initialize chessboard UI
function initializeBoard(boardEl, playerColor = 0) {
    // Clear the board first
    boardEl.innerHTML = '';

    // Create the 64 squares
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const sq = document.createElement('div');
            sq.classList.add('square', (r + c) % 2 === 0 ? 'white' : 'black');

            let rc = r;
            let cc = c;
            if (playerColor === 1) {
                rc = 7 - r;
                cc = 7 - c;
            }

            const pos = files[cc] + ranks[rc];
            sq.dataset.pos = pos;

            if (initialPieces[r]) {
                sq.textContent = initialPieces[rc][cc];
            }

            boardEl.appendChild(sq);
        }
    }

    return document.querySelectorAll('.square');
}

// Reset the board UI
function resetBoard(squares, playerColor = 0) {
    console.log("Resetting the board UI");

    // First clear all squares
    squares.forEach(sq => {
        sq.textContent = '';
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

            const pos = files[cc] + ranks[rc];
            const square = document.querySelector(`.square[data-pos="${pos}"]`);

            if (initialPieces[r] && initialPieces[r][c]) {
                createPiece(initialPieces[rc][cc], pos);
            }
        }
    }

    console.log("Board UI reset complete");
}

// Create a chess piece element
function createPiece(symbol, position) {
    const pieceElement = document.createElement('div');
    pieceElement.className = 'chess-piece';
    pieceElement.textContent = symbol;
    pieceElement.dataset.symbol = symbol;
    pieceElement.dataset.position = position;

    // Make pieces larger and centered
    pieceElement.style.fontSize = '50px';
    pieceElement.style.display = 'flex';
    pieceElement.style.justifyContent = 'center';
    pieceElement.style.alignItems = 'center';
    pieceElement.style.width = '90%';
    pieceElement.style.height = '90%';
    pieceElement.style.margin = 'auto';

    // Find the square and place the piece in it
    const square = document.querySelector(`.square[data-pos="${position}"]`);
    if (square) {
        square.appendChild(pieceElement);
    }

    return pieceElement;
}

// Initialize the piece system for the board
function setupPiecesSystem(squares) {
    console.log("Setting up piece system");

    // Clear any existing pieces
    const existingPieces = document.querySelectorAll('.chess-piece');
    existingPieces.forEach(piece => piece.remove());

    // Add chess-square class to all squares
    squares.forEach(sq => {
        sq.classList.add('chess-square');
        const pieceText = sq.textContent.trim();
        sq.textContent = '';

        if (pieceText && pieceText !== '.') {
            createPiece(pieceText, sq.dataset.pos);
        }
    });

    console.log("Piece system setup complete");
}

module.exports = {
    initializeBoard,
    resetBoard,
    createPiece,
    setupPiecesSystem,
    files,
    ranks,
    initialPieces
};