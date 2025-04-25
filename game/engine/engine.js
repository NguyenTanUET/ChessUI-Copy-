"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartChessEngine = StartChessEngine;
const pawn_1 = require("../pieces/pawn");
const king_1 = require("../pieces/king");
const knight_1 = require("../pieces/knight");
const bishop_1 = require("../pieces/bishop");
const rook_1 = require("../pieces/rook");
const consts_1 = require("../bitboard/consts");
const init_1 = require("../positions/init");
function StartChessEngine() {
    console.log("Starting chess engine....");
    (0, pawn_1.GeneratePawnAttackTables)();
    (0, king_1.GenerateKingAttackTables)();
    (0, knight_1.GenerateKnightAttackTables)();
    (0, bishop_1.GenerateBishopAttackTables)();
    (0, rook_1.GenerateRookAttackTables)();
    (0, consts_1.GenerateLines)();
    (0, init_1.GenerateZobristRandoms)();
}
