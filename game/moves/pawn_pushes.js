"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratePawnPushes = GeneratePawnPushes;
const bit_operations_1 = require("../bitboard/bit_operations");
const bit_boards_1 = require("../bitboard/bit_boards");
const move_1 = require("./move");
const rank5 = 0x00000000ff000000n;
const rank4 = 0x000000ff00000000n;
function GeneratePawnPushes(pawnBoard, empty, side, moveList) {
    if (side === bit_boards_1.Side.white) {
        let whiteSingle = (pawnBoard >> 8n) & 0xffffffffffffffn & empty;
        let whiteDouble = (whiteSingle >> 8n) & 0xffffffffffffffn & empty & rank4;
        while (whiteSingle) {
            let leastSingle = (0, bit_operations_1.CountSetBit)((whiteSingle & -whiteSingle) - 1n);
            if (leastSingle <= 7n) {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle + 8n), Number(leastSingle), move_1.MoveFlags.knight_promotion);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle + 8n), Number(leastSingle), move_1.MoveFlags.bishop_promotion);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle + 8n), Number(leastSingle), move_1.MoveFlags.rook_promotion);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle + 8n), Number(leastSingle), move_1.MoveFlags.queen_promotion);
            }
            else {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle + 8n), Number(leastSingle), move_1.MoveFlags.quiet_moves);
            }
            whiteSingle = whiteSingle & (whiteSingle - 1n);
        }
        while (whiteDouble) {
            let leastDouble = (0, bit_operations_1.CountSetBit)((whiteDouble & -whiteDouble) - 1n);
            moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastDouble + 16n), Number(leastDouble), move_1.MoveFlags.double_push);
            whiteDouble = whiteDouble & (whiteDouble - 1n);
        }
    }
    else {
        let blackSingle = (pawnBoard << 8n) & empty;
        let blackDouble = (blackSingle << 8n) & empty & rank5;
        while (blackSingle) {
            let leastSingle = (0, bit_operations_1.CountSetBit)((blackSingle & -blackSingle) - 1n);
            if (leastSingle >= 56n) {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle - 8n), Number(leastSingle), move_1.MoveFlags.bishop_promotion);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle - 8n), Number(leastSingle), move_1.MoveFlags.knight_promotion);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle - 8n), Number(leastSingle), move_1.MoveFlags.rook_promotion);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle - 8n), Number(leastSingle), move_1.MoveFlags.queen_promotion);
            }
            else {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastSingle - 8n), Number(leastSingle), move_1.MoveFlags.quiet_moves);
            }
            blackSingle = blackSingle & (blackSingle - 1n);
        }
        while (blackDouble) {
            let leastDouble = (0, bit_operations_1.CountSetBit)((blackDouble & -blackDouble) - 1n);
            moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(leastDouble - 16n), Number(leastDouble), move_1.MoveFlags.double_push);
            blackDouble = blackDouble & (blackDouble - 1n);
        }
    }
}
