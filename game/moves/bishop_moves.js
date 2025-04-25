"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateBishopMoves = GenerateBishopMoves;
const bit_operations_1 = require("../bitboard/bit_operations");
const bishop_1 = require("../pieces/bishop");
const bit_boards_1 = require("../bitboard/bit_boards");
const move_1 = require("./move");
function GenerateBishopMoves(bishopBoard, occupancy, side, moveList) {
    while (bishopBoard) {
        let source = (0, bit_operations_1.CountSetBit)((bishopBoard & -bishopBoard) - 1n);
        let attackBoard = (0, bishop_1.GetBishopAttacks)(source, occupancy[bit_boards_1.Side.both]) & ~occupancy[side];
        while (attackBoard) {
            let target = (0, bit_operations_1.CountSetBit)((attackBoard & -attackBoard) - 1n);
            if (!((occupancy[1 - side] >> target) & 1n)) {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.quiet_moves);
            }
            else {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.capture);
            }
            attackBoard = attackBoard & (attackBoard - 1n);
        }
        bishopBoard = bishopBoard & (bishopBoard - 1n);
    }
}
