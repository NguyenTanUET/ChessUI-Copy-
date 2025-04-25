"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinesBetween = exports.LinesIntersect = void 0;
exports.GenerateLines = GenerateLines;
const rook_1 = require("../pieces/rook");
const bishop_1 = require("../pieces/bishop");
exports.LinesIntersect = Array.from(Array(64), () => new BigUint64Array(64));
exports.LinesBetween = Array.from(Array(64), () => new BigUint64Array(64));
function GenerateLines() {
    for (let i = 0n; i < 64n; i++) {
        for (let j = 0n; j < 64n; j++) {
            if (i == j)
                continue;
            let dif = Math.abs(Number(i - j));
            if ((dif < 8n && i / 8n === j / 8n) || (i - j) % 8n === 0n) {
                exports.LinesIntersect[Number(i)][Number(j)] = ((0, rook_1.GetRookAttacks)(i, 0n) & (0, rook_1.GetRookAttacks)(j, 0n)) | (1n << i) | (1n << j);
                exports.LinesBetween[Number(i)][Number(j)] = (0, rook_1.GetRookAttacks)(i, 1n << j) & (0, rook_1.GetRookAttacks)(j, 1n << i);
            }
            else if (dif % 9 === 0 || dif % 7 == 0) {
                exports.LinesIntersect[Number(i)][Number(j)] = (((0, bishop_1.GetBishopAttacks)(i, 0n) & (0, bishop_1.GetBishopAttacks)(j, 0n)) | (1n << i) | (1n << j));
                exports.LinesBetween[Number(i)][Number(j)] = (0, bishop_1.GetBishopAttacks)(i, 1n << j) & (0, bishop_1.GetBishopAttacks)(j, 1n << i);
            }
            else {
                exports.LinesIntersect[Number(i)][Number(j)] = 0n;
                exports.LinesBetween[Number(i)][Number(j)] = 0n;
            }
        }
    }
}
