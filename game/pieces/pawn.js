"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PawnAttackTables = void 0;
exports.GeneratePawnAttackTables = GeneratePawnAttackTables;
const consts_1 = require("./consts");
exports.PawnAttackTables = Array.from(Array(2), () => new BigUint64Array(64));
function GeneratePawnAttackTables() {
    for (let i = 0n; i < 64; i++) {
        exports.PawnAttackTables[0][Number(i)] = MaskPawnAttack(0, i);
        exports.PawnAttackTables[1][Number(i)] = MaskPawnAttack(1, i);
    }
}
function MaskPawnAttack(side, index) {
    let attackBoard = 0n;
    let pieceBoard = 1n << index;
    if (!side) {
        attackBoard |= ((pieceBoard >> 7n) & 0x1ffffffffffffffn & consts_1.NotAFile);
        attackBoard |= ((pieceBoard >> 9n) & 0x7fffffffffffffn & consts_1.NotHFile);
    }
    else {
        attackBoard |= ((pieceBoard << 7n) & consts_1.NotHFile);
        attackBoard |= ((pieceBoard << 9n) & consts_1.NotAFile);
    }
    return attackBoard;
}
