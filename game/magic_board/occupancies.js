"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateOccupancyBoard = GenerateOccupancyBoard;
const bit_operations_1 = require("../bitboard/bit_operations");
const bishop_1 = require("../pieces/bishop");
const rook_1 = require("../pieces/rook");
const crypto = require("crypto");
function GenerateOccupancyBoard(set_index, mask_bits_count, attackboard) {
    let occupancy = 0n;
    for (let count = 0n; count < mask_bits_count; count++) {
        let index = (0, bit_operations_1.CountSetBit)((attackboard & -attackboard) - 1n);
        attackboard = attackboard & (attackboard - 1n);
        if (set_index & (1n << count)) {
            occupancy |= (1n << index);
        }
    }
    return occupancy;
}
function GenerateRandomNumber() {
    return crypto.randomBytes(8).readBigUInt64BE(0);
}
function RandomBigInt() {
    let u1, u2, u3, u4;
    u1 = (GenerateRandomNumber()) & 0xffffn;
    u2 = (GenerateRandomNumber()) & 0xffffn;
    u3 = (GenerateRandomNumber()) & 0xffffn;
    u4 = (GenerateRandomNumber()) & 0xffffn;
    return u1 | (u2 << 16n) | (u3 << 32n) | (u4 << 48n);
}
function RandomLowSetBit() {
    return RandomBigInt() & RandomBigInt() & RandomBigInt();
}
function GenerateMagicNumber(index, relevantBitCounts, isBishop) {
    let occupancies = new BigUint64Array(4096);
    let attackTables = new BigUint64Array(4096);
    let usedAttacks;
    let attackMask = isBishop ? (0, bishop_1.MaskBishopAttacks)(index) : (0, rook_1.MaskRookAttacks)(index);
    let occupancyIndices = 1n << relevantBitCounts;
    for (let oIndex = 0n; oIndex < occupancyIndices; oIndex++) {
        occupancies[Number(oIndex)] = GenerateOccupancyBoard(oIndex, relevantBitCounts, attackMask);
        attackTables[Number(oIndex)] = isBishop ? (0, bishop_1.GenerateBishopAttacks)(index, occupancies[Number(oIndex)]) :
            (0, rook_1.GenerateRookAttacks)(index, occupancies[Number(oIndex)]);
    }
    for (let randomCount = 0; randomCount < 1000000; randomCount++) {
        let magicNumber = RandomLowSetBit();
        if ((0, bit_operations_1.CountSetBit)((attackMask * magicNumber) & 0xff00000000000000n) < 6n)
            continue;
        usedAttacks = new BigUint64Array(4096);
        let tIndex, fail;
        for (tIndex = 0, fail = 0; !fail && tIndex < occupancyIndices; tIndex++) {
            let magic_index = ((occupancies[tIndex] * magicNumber) >> (64n - relevantBitCounts)) & ((1n << (64n - (64n - relevantBitCounts))) - 1n);
            if (usedAttacks[Number(magic_index)] === 0n) {
                usedAttacks[Number(magic_index)] = attackTables[tIndex];
            }
            else if (usedAttacks[Number(magic_index)] !== attackTables[tIndex]) {
                fail = 1;
            }
        }
        if (!fail) {
            return magicNumber;
        }
    }
    return 0n;
}
