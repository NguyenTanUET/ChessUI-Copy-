const { AlgebraicToMove } = require("../game/bitboard/conversions");
const { GenerateMoves } = require("../game/moves/movegen");
const { GenMoveString, GetMoveFlag, MoveFlags } = require("../game/moves/move");
const { ExecuteMove } = require("../game/moves/execute_move");

// Get possible moves for a piece at a position
function getPossibleMoves(gameState, fromPos) {
    const list = GenerateMoves(gameState);
    const result = [];

    for (let i = 0; i < list.count; i++) {
        const mv = GenMoveString(list.moves[i]);
        if (mv.startsWith(fromPos)) {
            result.push(mv.slice(2, 4));
        }
    }
    return result;
}

// Execute a move on the game state
function executeMove(gameState, move) {
    let moveConverted = AlgebraicToMove(move, GenerateMoves(gameState));
    return ExecuteMove(gameState, moveConverted);
}

// Animate moving a piece
function animatePieceMove(fromPos, toPos, callback) {
    const fromSquare = document.querySelector(`.square[data-pos="${fromPos}"]`);
    const toSquare = document.querySelector(`.square[data-pos="${toPos}"]`);
    const pieceElement = fromSquare.querySelector('.chess-piece');

    if (!fromSquare || !toSquare || !pieceElement) {
        console.error('Missing elements for animation', fromPos, toPos);
        if (callback) callback();
        return;
    }

    // Handle capture
    const capturedPiece = toSquare.querySelector('.chess-piece');
    if (capturedPiece) {
        capturedPiece.style.zIndex = '5';
        capturedPiece.classList.add('captured');

        setTimeout(() => {
            capturedPiece.remove();
        }, 300);
    }

    // Get positions for animation
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();

    // Create clone for animation
    const clone = document.createElement('div');
    clone.className = 'piece-clone';
    clone.textContent = pieceElement.textContent;
    clone.dataset.symbol = pieceElement.dataset.symbol || pieceElement.textContent;

    // Position clone
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
    clone.style.transition = 'all 0.3s ease';

    document.body.appendChild(clone);
    pieceElement.remove();

    // Force reflow
    void clone.offsetWidth;

    // Animate
    setTimeout(() => {
        clone.style.top = `${toRect.top}px`;
        clone.style.left = `${toRect.left}px`;

        // After animation completes
        setTimeout(() => {
            clone.remove();
            const { createPiece } = require('./boardSetup');
            createPiece(clone.dataset.symbol, toPos);
            if (callback) callback();
        }, 350);
    }, 10);
}

// Animate castling
function animateCastling(kingFrom, kingTo, callback) {
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

module.exports = {
    getPossibleMoves,
    executeMove,
    animatePieceMove,
    animateCastling,
    MoveFlags,
    GetMoveFlag
};