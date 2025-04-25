"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BishopAttackTables = exports.BishopAttackMask = exports.BishopRelevancyBitCounts = void 0;
exports.GenerateBishopAttackTables = GenerateBishopAttackTables;
exports.MaskBishopAttacks = MaskBishopAttacks;
exports.GenerateBishopAttacks = GenerateBishopAttacks;
exports.GetBishopAttacks = GetBishopAttacks;
const bit_operations_1 = require("../bitboard/bit_operations");
const occupancies_1 = require("../magic_board/occupancies");
const magic_numbers_1 = require("../magic_board/magic_numbers");
exports.BishopRelevancyBitCounts = new Uint8Array([
    6, 5, 5, 5, 5, 5, 5, 6,
    5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 7, 7, 7, 7, 5, 5,
    5, 5, 7, 9, 9, 7, 5, 5,
    5, 5, 7, 9, 9, 7, 5, 5,
    5, 5, 7, 7, 7, 7, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5,
    6, 5, 5, 5, 5, 5, 5, 6
]);
exports.BishopAttackMask = new BigUint64Array(64);
exports.BishopAttackTables = Array.from(Array(64), () => new BigUint64Array(512));
function GenerateBishopAttackTables() {
    for (let i = 0n; i < 64; i++) {
        exports.BishopAttackMask[Number(i)] = MaskBishopAttacks(i);
        let relevantBitcounts = (0, bit_operations_1.CountSetBit)(exports.BishopAttackMask[Number(i)]);
        let occupancyIndices = (1n << relevantBitcounts);
        for (let index = 0n; index < occupancyIndices; index++) {
            let occupancy = (0, occupancies_1.GenerateOccupancyBoard)(index, relevantBitcounts, exports.BishopAttackMask[Number(i)]);
            let magic_index = ((occupancy * magic_numbers_1.BishopMagicNumbers[Number(i)]) >> BigInt(64 - exports.BishopRelevancyBitCounts[Number(i)])) & ((1n << (64n - BigInt(64 - exports.BishopRelevancyBitCounts[Number(i)]))) - 1n);
            exports.BishopAttackTables[Number(i)][Number(magic_index)] = GenerateBishopAttacks(i, occupancy);
        }
    }
}
function MaskBishopAttacks(index) {
    let attackBoard = 0n;
    for (let rank = (index / 8n) + 1n, file = (index % 8n) + 1n; rank <= 6n && file <= 6n; rank++, file++) {
        attackBoard |= (1n << (rank * 8n + file));
    }
    for (let rank = (index / 8n) + 1n, file = (index % 8n) - 1n; rank <= 6n && file >= 1n; rank++, file--) {
        attackBoard |= (1n << (rank * 8n + file));
    }
    for (let rank = (index / 8n) - 1n, file = (index % 8n) + 1n; rank >= 1n && file <= 6n; rank--, file++) {
        attackBoard |= (1n << (rank * 8n + file));
    }
    for (let rank = (index / 8n) - 1n, file = (index % 8n) - 1n; rank >= 1n && file >= 1n; rank--, file--) {
        attackBoard |= (1n << (rank * 8n + file));
    }
    return attackBoard;
}
function GenerateBishopAttacks(index, blockTable) {
    let attackBoard = 0n;
    for (let rank = (index / 8n) + 1n, file = (index % 8n) + 1n; rank <= 7n && file <= 7n; rank++, file++) {
        attackBoard |= (1n << (rank * 8n + file));
        if ((1n << (rank * 8n + file)) & blockTable)
            break;
    }
    for (let rank = (index / 8n) + 1n, file = (index % 8n) - 1n; rank <= 7n && file >= 0n; rank++, file--) {
        attackBoard |= (1n << (rank * 8n + file));
        if ((1n << (rank * 8n + file)) & blockTable)
            break;
    }
    for (let rank = (index / 8n) - 1n, file = (index % 8n) + 1n; rank >= 0n && file <= 7n; rank--, file++) {
        attackBoard |= (1n << (rank * 8n + file));
        if ((1n << (rank * 8n + file)) & blockTable)
            break;
    }
    for (let rank = (index / 8n) - 1n, file = (index % 8n) - 1n; rank >= 0n && file >= 0n; rank--, file--) {
        attackBoard |= (1n << (rank * 8n + file));
        if ((1n << (rank * 8n + file)) & blockTable)
            break;
    }
    return attackBoard;
}
function GetBishopAttacks(index, occupancy) {
    occupancy &= exports.BishopAttackMask[Number(index)];
    occupancy *= magic_numbers_1.BishopMagicNumbers[Number(index)];
    occupancy = (occupancy >> BigInt(64 - exports.BishopRelevancyBitCounts[Number(index)])) & ((1n << (64n - BigInt(64 - exports.BishopRelevancyBitCounts[Number(index)]))) - 1n);
    return exports.BishopAttackTables[Number(index)][Number(occupancy)];
}
