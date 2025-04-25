"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KingAttackTables = void 0;
exports.GenerateKingAttackTables = GenerateKingAttackTables;
const consts_1 = require("./consts");
exports.KingAttackTables = new BigUint64Array(64);
function GenerateKingAttackTables() {
    for (let i = 0n; i < 64; i++) {
        exports.KingAttackTables[Number(i)] = MaskKingAttacks(i);
    }
}
function MaskKingAttacks(index) {
    let attackBoard = 0n;
    let pieceBoard = 1n << index;
    attackBoard |= (pieceBoard >> 7n) & 0x1ffffffffffffffn & consts_1.NotAFile;
    attackBoard |= (pieceBoard >> 8n) & 0xffffffffffffffn;
    attackBoard |= (pieceBoard >> 9n) & 0x7fffffffffffffn & consts_1.NotHFile;
    attackBoard |= (pieceBoard >> 1n) & 0x7fffffffffffffffn & consts_1.NotHFile;
    attackBoard |= (pieceBoard << 7n) & consts_1.NotHFile;
    attackBoard |= pieceBoard << 8n;
    attackBoard |= (pieceBoard << 9n) & consts_1.NotAFile;
    attackBoard |= (pieceBoard << 1n) & consts_1.NotAFile;
    return attackBoard;
}
