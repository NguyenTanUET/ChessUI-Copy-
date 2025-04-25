"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RookAttackTables = exports.RookAttackMask = exports.RookRelevancyBitCounts = void 0;
exports.GenerateRookAttackTables = GenerateRookAttackTables;
exports.MaskRookAttacks = MaskRookAttacks;
exports.GenerateRookAttacks = GenerateRookAttacks;
exports.GetRookAttacks = GetRookAttacks;
const bit_operations_1 = require("../bitboard/bit_operations");
const occupancies_1 = require("../magic_board/occupancies");
const magic_numbers_1 = require("../magic_board/magic_numbers");
exports.RookRelevancyBitCounts = new Uint8Array([
    12, 11, 11, 11, 11, 11, 11, 12,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    11, 10, 10, 10, 10, 10, 10, 11,
    12, 11, 11, 11, 11, 11, 11, 12
]);
exports.RookAttackMask = new BigUint64Array(64);
exports.RookAttackTables = Array.from(Array(64), () => new BigUint64Array(4096));
function GenerateRookAttackTables() {
    for (let i = 0n; i < 64n; i++) {
        exports.RookAttackMask[Number(i)] = MaskRookAttacks(i);
        let relevantBitcounts = (0, bit_operations_1.CountSetBit)(exports.RookAttackMask[Number(i)]);
        let occupancyIndices = (1n << relevantBitcounts);
        for (let index = 0n; index < occupancyIndices; index++) {
            let occupancy = (0, occupancies_1.GenerateOccupancyBoard)(index, relevantBitcounts, exports.RookAttackMask[Number(i)]);
            let magic_index = ((occupancy * magic_numbers_1.RookMagicNumber[Number(i)]) >> BigInt(64 - exports.RookRelevancyBitCounts[Number(i)])) & ((1n << (64n - BigInt(64 - exports.RookRelevancyBitCounts[Number(i)]))) - 1n);
            exports.RookAttackTables[Number(i)][Number(magic_index)] = GenerateRookAttacks(i, occupancy);
        }
    }
}
function MaskRookAttacks(index) {
    let attackBoard = 0n;
    for (let rank = (index / 8n) + 1n; rank <= 6n; rank++) {
        attackBoard |= 1n << (rank * 8n + (index % 8n));
    }
    for (let rank = (index / 8n) - 1n; rank >= 1n; rank--) {
        attackBoard |= 1n << (rank * 8n + (index % 8n));
    }
    for (let file = (index % 8n) + 1n; file <= 6n; file++) {
        attackBoard |= 1n << ((index / 8n) * 8n + file);
    }
    for (let file = (index % 8n) - 1n; file >= 1n; file--) {
        attackBoard |= 1n << ((index / 8n) * 8n + file);
    }
    return attackBoard;
}
function GenerateRookAttacks(index, blockTable) {
    let attackBoard = 0n;
    for (let rank = (index / 8n) + 1n; rank <= 7n; rank++) {
        attackBoard |= 1n << (rank * 8n + (index % 8n));
        if ((1n << (rank * 8n + (index % 8n))) & blockTable)
            break;
    }
    for (let rank = (index / 8n) - 1n; rank >= 0n; rank--) {
        attackBoard |= 1n << (rank * 8n + (index % 8n));
        if ((1n << (rank * 8n + (index % 8n))) & blockTable)
            break;
    }
    for (let file = (index % 8n) + 1n; file <= 7n; file++) {
        attackBoard |= 1n << ((index / 8n) * 8n + file);
        if ((1n << ((index / 8n) * 8n + file)) & blockTable)
            break;
    }
    for (let file = (index % 8n) - 1n; file >= 0n; file--) {
        attackBoard |= 1n << ((index / 8n) * 8n + file);
        if ((1n << ((index / 8n) * 8n + file)) & blockTable)
            break;
    }
    return attackBoard;
}
function GetRookAttacks(index, occupancy) {
    occupancy &= exports.RookAttackMask[Number(index)];
    occupancy *= magic_numbers_1.RookMagicNumber[Number(index)];
    occupancy = (occupancy >> BigInt(64 - exports.RookRelevancyBitCounts[Number(index)])) & ((1n << (64n - BigInt(64 - exports.RookRelevancyBitCounts[Number(index)]))) - 1n);
    return exports.RookAttackTables[Number(index)][Number(occupancy)];
}
