const gameState = require('./gameState');
const engineCommunication = require('./engineCommunication');
const boardSetup = require('./boardSetup');
const pieceMovement = require('./pieceMovement');
const promotionDialog = require('./promotionDialog');
const gameUI = require('./gameUI');
const playerVsAI = require('./playerVsAI');
const botVsBot = require('./botVsBot');

module.exports = {
    gameState,
    engineCommunication,
    boardSetup,
    pieceMovement,
    promotionDialog,
    gameUI,
    playerVsAI,
    botVsBot
};
