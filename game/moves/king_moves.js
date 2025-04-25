"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateKingMoves = GenerateKingMoves;
const bit_operations_1 = require("../bitboard/bit_operations");
const king_1 = require("../pieces/king");
const move_1 = require("./move");
function GenerateKingMoves(kingBoard, allyOccupancy, opponentOccupancy, moveList) {
    while (kingBoard) {
        let source = (0, bit_operations_1.CountSetBit)((kingBoard & -kingBoard) - 1n);
        let attackBoard = king_1.KingAttackTables[Number(source)] & ~allyOccupancy;
        while (attackBoard) {
            let target = (0, bit_operations_1.CountSetBit)((attackBoard & -attackBoard) - 1n);
            if (!((opponentOccupancy >> target) & 1n)) {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.quiet_moves);
            }
            else {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.capture);
            }
            attackBoard = attackBoard & (attackBoard - 1n);
        }
        kingBoard = kingBoard & (kingBoard - 1n);
    }
}
