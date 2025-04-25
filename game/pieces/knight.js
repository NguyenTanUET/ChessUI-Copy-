"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnightAttackTables = void 0;
exports.GenerateKnightAttackTables = GenerateKnightAttackTables;
const consts_1 = require("./consts");
exports.KnightAttackTables = new BigUint64Array(64);
function GenerateKnightAttackTables() {
    for (let i = 0n; i < 64; i++) {
        exports.KnightAttackTables[Number(i)] = MaskKnightAttacks(i);
    }
}
function MaskKnightAttacks(index) {
    let attackBoard = 0n;
    let pieceBoard = 1n << index;
    attackBoard |= ((pieceBoard >> 17n) & 0x7fffffffffffn & consts_1.NotHFile);
    attackBoard |= ((pieceBoard >> 15n) & 0x1ffffffffffffn & consts_1.NotAFile);
    attackBoard |= ((pieceBoard >> 10n) & 0x3fffffffffffffn & consts_1.NotGHFile);
    attackBoard |= ((pieceBoard >> 6n) & 0x3ffffffffffffffn & consts_1.NotABFile);
    attackBoard |= ((pieceBoard << 17n) & consts_1.NotAFile);
    attackBoard |= ((pieceBoard << 15n) & consts_1.NotHFile);
    attackBoard |= ((pieceBoard << 10n) & consts_1.NotABFile);
    attackBoard |= ((pieceBoard << 6n) & consts_1.NotGHFile);
    return attackBoard;
}
