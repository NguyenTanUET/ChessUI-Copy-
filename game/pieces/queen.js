"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetQueenAttacks = GetQueenAttacks;
const bishop_1 = require("./bishop");
const rook_1 = require("./rook");
const magic_numbers_1 = require("../magic_board/magic_numbers");
function GetQueenAttacks(index, occupancy) {
    let bishopOccupancy = occupancy;
    let rookOccupancy = occupancy;
    bishopOccupancy &= bishop_1.BishopAttackMask[Number(index)];
    bishopOccupancy *= magic_numbers_1.BishopMagicNumbers[Number(index)];
    bishopOccupancy = (bishopOccupancy >> BigInt(64 - bishop_1.BishopRelevancyBitCounts[Number(index)])) & ((1n << (64n - BigInt(64 - bishop_1.BishopRelevancyBitCounts[Number(index)]))) - 1n);
    rookOccupancy &= rook_1.RookAttackMask[Number(index)];
    rookOccupancy *= magic_numbers_1.RookMagicNumber[Number(index)];
    rookOccupancy = (rookOccupancy >> BigInt(64 - rook_1.RookRelevancyBitCounts[Number(index)])) & ((1n << (64n - BigInt(64 - rook_1.RookRelevancyBitCounts[Number(index)]))) - 1n);
    return bishop_1.BishopAttackTables[Number(index)][Number(bishopOccupancy)] | rook_1.RookAttackTables[Number(index)][Number(rookOccupancy)];
}
