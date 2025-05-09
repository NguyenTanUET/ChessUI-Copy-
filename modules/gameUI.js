// Show or clear highlights on the board
function showHighlights(possibleMoves, fromPos) {
    // First clear any existing highlights
    clearHighlights();

    // Add highlight to squares in the possible moves list
    possibleMoves.forEach(to => {
        const target = document.querySelector(`.square[data-pos="${to}"]`);
        if (target) target.classList.add('highlight');
    });
}

// Clear all highlights
function clearHighlights() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(sq => sq.classList.remove('highlight'));
}

// Show game result dialog
function showGameResult(gameResult, onNewGame) {
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

        // Call the onNewGame callback
        if (onNewGame) onNewGame();
    });
}

module.exports = {
    showHighlights,
    clearHighlights,
    showGameResult
};