// Show the promotion dialog
function showPromotionOptions(fromPos, toPos, playerColor, onPromotionSelect) {
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

            // Call the callback with the selected promotion piece
            onPromotionSelect(piece);
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

// Get the promotion piece character
function getPromotionChar(promotionPiece, sideToMove) {
    if (sideToMove === 0) { // For white promoting
        switch (promotionPiece) {
            case 'q': return '♕';
            case 'r': return '♖';
            case 'b': return '♗';
            case 'n': return '♘';
            default: return '♕';
        }
    } else { // For black promoting
        switch (promotionPiece) {
            case 'q': return '♛';
            case 'r': return '♜';
            case 'b': return '♝';
            case 'n': return '♞';
            default: return '♛';
        }
    }
}

module.exports = {
    showPromotionOptions,
    getPromotionChar
};