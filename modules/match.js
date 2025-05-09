"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckEndGame = CheckEndGame;
exports.DisplayGameResult = DisplayGameResult;

const bit_operations_1 = require("../game/bitboard/bit_operations");
const bit_boards_1 = require("../game/bitboard/bit_boards");
const {IsKingInCheck} = require("../game/moves/attacks");

/**
 * Kiểm tra trạng thái kết thúc trò chơi
 * @param {Object} gameState - Trạng thái hiện tại của trò chơi
 * @param {Object} legalMoveList - Danh sách các nước đi hợp lệ
 * @returns {number} - Mã trạng thái kết thúc trò chơi:
 *   0: Trò chơi đang tiếp tục
 *   1: Chiếu hết (người chơi hiện tại thua)
 *   2: Bế tắc (hòa)
 *   3: Luật 50 nước đi (hòa)
 *   4: Lặp lại vị trí 3 lần (hòa)
 *   5: Không đủ quân để chiếu hết (hòa)
 */
function CheckEndGame(gameState, legalMoveList) {
    // Kiểm tra chiếu hết hoặc bế tắc
    if (legalMoveList.count === 0) {
        // Nếu vua đang bị chiếu và không có nước đi hợp lệ -> chiếu hết
        if (IsKingInCheck(gameState, 1 - gameState.SideToMove) !== -1) {
            return 1; // Chiếu hết
        } else {
            return 2; // Bế tắc
        }
    }
    // Kiểm tra luật 50 nước đi
    else if (gameState.HalfMoves >= 100) {
        return 3; // Hòa do luật 50 nước đi
    }

    // Đếm số quân còn lại trên bàn cờ
    let piecesLeft = (0, bit_operations_1.CountSetBit)(gameState.OccupancyBoards[bit_boards_1.Side.both]);

    // Kiểm tra trường hợp không đủ quân để chiếu hết
    if (piecesLeft === 2n) {
        return 5; // Chỉ còn 2 vua -> hòa
    } else if (piecesLeft === 3n) {
        // Trường hợp một bên chỉ còn vua và quân khác (mã hoặc tượng)
        if ((0, bit_operations_1.CountSetBit)(gameState.OccupancyBoards[bit_boards_1.Side.white]) === 1n) {
            if (gameState.PieceBitboards[bit_boards_1.Pieces.n] || gameState.PieceBitboards[bit_boards_1.Pieces.b]) {
                return 5; // Hòa vì không đủ quân để chiếu hết
            }
        } else {
            if (gameState.PieceBitboards[bit_boards_1.Pieces.N] || gameState.PieceBitboards[bit_boards_1.Pieces.B]) {
                return 5; // Hòa vì không đủ quân để chiếu hết
            }
        }
    } else if (piecesLeft === 4n &&
        (0, bit_operations_1.CountSetBit)(gameState.OccupancyBoards[bit_boards_1.Side.white]) === 2n &&
        (0, bit_operations_1.CountSetBit)(gameState.OccupancyBoards[bit_boards_1.Side.black]) === 2n) {
        // Trường hợp cả hai bên chỉ còn vua và tượng -> hòa
        if ((gameState.PieceBitboards[bit_boards_1.Pieces.k] || gameState.PieceBitboards[bit_boards_1.Pieces.b]) &&
            (gameState.PieceBitboards[bit_boards_1.Pieces.K] || gameState.PieceBitboards[bit_boards_1.Pieces.B])) {
            return 5;
        }
    }

    // Kiểm tra lặp lại vị trí 3 lần
    if (gameState.PastPositions.length >= 9) {
        let counter = 1;
        for (let i = 0; i < gameState.PastPositions.length; i += 4) {
            if (gameState.PastPositions[0] !== gameState.PastPositions[i]) break;
            else counter++;
        }
        if (counter >= 3) return 4; // Hòa do lặp lại vị trí
    }

    return 0; // Trò chơi đang tiếp tục
}

/**
 * Hiển thị kết quả trò chơi dựa trên mã trạng thái kết thúc
 * @param {number} endGameCode - Mã trạng thái kết thúc trò chơi
 * @param {number} sideToMove - Bên đang đi (0: Trắng, 1: Đen)
 * @returns {Object} - Thông tin về kết quả trò chơi
 */
function DisplayGameResult(endGameCode, sideToMove) {
    const result = {
        isGameOver: endGameCode !== 0,
        message: "",
        winner: null, // null: hòa, 0: trắng thắng, 1: đen thắng
        result: ""
    };

    switch(endGameCode) {
        case 0:
            // Trò chơi đang tiếp tục
            result.message = "Trò chơi đang diễn ra";
            break;
        case 1:
            // Chiếu hết - người chơi hiện tại thua
            const winner = 1 - sideToMove; // Bên đối phương thắng
            result.winner = winner;
            result.message = winner === 0 ? "Trắng thắng bằng chiếu hết!" : "Đen thắng bằng chiếu hết!";
            result.result = winner === 0 ? "1-0" : "0-1";
            break;
        case 2:
            // Bế tắc
            result.message = "Hòa do bế tắc!";
            result.result = "1/2-1/2";
            break;
        case 3:
            // Luật 50 nước đi
            result.message = "Hòa do luật 50 nước đi!";
            result.result = "1/2-1/2";
            break;
        case 4:
            // Lặp lại vị trí 3 lần
            result.message = "Hòa do lặp lại vị trí 3 lần!";
            result.result = "1/2-1/2";
            break;
        case 5:
            // Không đủ quân để chiếu hết
            result.message = "Hòa do không đủ quân để chiếu hết!";
            result.result = "1/2-1/2";
            break;
        default:
            result.message = "Trạng thái không xác định";
    }

    return result;
}