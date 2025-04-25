"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateKnightMoves = GenerateKnightMoves;
const bit_operations_1 = require("../bitboard/bit_operations");
const knight_1 = require("../pieces/knight");
const move_1 = require("./move");
function GenerateKnightMoves(knightBoard, allyOccupancy, opponentOccupancy, moveList) {
    while (knightBoard) {
        let source = (0, bit_operations_1.CountSetBit)((knightBoard & -knightBoard) - 1n);
        let attackBoard = knight_1.KnightAttackTables[Number(source)] & ~allyOccupancy;
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
        knightBoard = knightBoard & (knightBoard - 1n);
    }
}
