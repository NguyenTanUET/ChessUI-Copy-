"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratePawnCaptures = GeneratePawnCaptures;
const bit_operations_1 = require("../bitboard/bit_operations");
const pawn_1 = require("../pieces/pawn");
const move_1 = require("./move");
function EnPassant(enPassantSquare) {
    if (enPassantSquare === -1)
        return 0n;
    return 1n << BigInt(enPassantSquare);
}
function GeneratePawnCaptures(pawnBoard, enemyOccupancy, enPassantSquare, side, moveList) {
    while (pawnBoard) {
        let source = (0, bit_operations_1.CountSetBit)((pawnBoard & -pawnBoard) - 1n);
        let target;
        let attacks = pawn_1.PawnAttackTables[side][Number(source)] & (enemyOccupancy | EnPassant(enPassantSquare));
        while (attacks) {
            target = (0, bit_operations_1.CountSetBit)((attacks & -attacks) - 1n);
            if (target > 7n && target < 56n) {
                if (enPassantSquare !== -1 && target === BigInt(enPassantSquare)) {
                    moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.ep_capture);
                }
                else {
                    moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.capture);
                }
            }
            else {
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.rook_promo_capture);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.knight_promo_capture);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.bishop_promo_capture);
                moveList.moves[moveList.count++] = (0, move_1.MakeMove)(Number(source), Number(target), move_1.MoveFlags.queen_promo_capture);
            }
            attacks = attacks & (attacks - 1n);
        }
        pawnBoard = pawnBoard & (pawnBoard - 1n);
    }
}
