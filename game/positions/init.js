"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscellaneousKey = exports.EnPassantFile = exports.PiecePositionKey = void 0;
exports.GenerateZobristRandoms = GenerateZobristRandoms;
const crypto = require("crypto");
exports.PiecePositionKey = Array.from(Array(12), () => new BigUint64Array(64));
exports.EnPassantFile = new BigUint64Array(8);
// Four for castling, 2 for side to move.
exports.MiscellaneousKey = new BigUint64Array(6);
function GenerateZobristRandoms() {
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 64; j++) {
            exports.PiecePositionKey[i][j] = crypto.randomBytes(8).readBigUInt64BE(0);
        }
    }
    for (let i = 0; i < 8; i++) {
        exports.EnPassantFile[i] = crypto.randomBytes(8).readBigUInt64BE(0);
    }
    for (let i = 0; i < 5; i++) {
        exports.MiscellaneousKey[i] = crypto.randomBytes(8).readBigUInt64BE(0);
    }
}
