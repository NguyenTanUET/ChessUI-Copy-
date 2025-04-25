"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateRookMoves = GenerateRookMoves;
const bit_operations_1 = require("../bitboard/bit_operations");
const bit_boards_1 = require("../bitboard/bit_boards");
const rook_1 = require("../pieces/rook");
const move_1 = require("./move");
function GenerateRookMoves(rookBoard, occupancy, side, moveList) {
    while (rookBoard) {
        let source = (0, bit_operations_1.CountSetBit)((rookBoard & -rookBoard) - 1n);
        let attackBoard = (0, rook_1.GetRookAttacks)(source, occupancy[bit_boards_1.Side.both]) & ~occupancy[side];
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
        rookBoard = rookBoard & (rookBoard - 1n);
    }
}
