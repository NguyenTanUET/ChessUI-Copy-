"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSquareAttacked = IsSquareAttacked;
exports.PrintAttackedSquare = PrintAttackedSquare;
exports.IsKingInCheck = IsKingInCheck;
const bit_operations_1 = require("../bitboard/bit_operations");
const bit_boards_1 = require("../bitboard/bit_boards");
const pawn_1 = require("../pieces/pawn");
const knight_1 = require("../pieces/knight");
const bishop_1 = require("../pieces/bishop");
const rook_1 = require("../pieces/rook");
const king_1 = require("../pieces/king");
function IsSquareAttacked(pieceBoards, occupancyBoards, index, attackedBy) {
    if (attackedBy === bit_boards_1.Side.white) {
        if ((0, bishop_1.GetBishopAttacks)(BigInt(index), occupancyBoards[bit_boards_1.Side.both]) & (pieceBoards[bit_boards_1.Pieces.B] | pieceBoards[bit_boards_1.Pieces.Q]))
            return true;
        if ((0, rook_1.GetRookAttacks)(BigInt(index), occupancyBoards[bit_boards_1.Side.both]) & (pieceBoards[bit_boards_1.Pieces.R] | pieceBoards[bit_boards_1.Pieces.Q]))
            return true;
        if (knight_1.KnightAttackTables[index] & pieceBoards[bit_boards_1.Pieces.N])
            return true;
        if (pawn_1.PawnAttackTables[bit_boards_1.Side.black][index] & pieceBoards[bit_boards_1.Pieces.P])
            return true;
        if (king_1.KingAttackTables[index] & pieceBoards[bit_boards_1.Pieces.K])
            return true;
    }
    else {
        if ((0, bishop_1.GetBishopAttacks)(BigInt(index), occupancyBoards[bit_boards_1.Side.both]) & (pieceBoards[bit_boards_1.Pieces.b] | pieceBoards[bit_boards_1.Pieces.q]))
            return true;
        if ((0, rook_1.GetRookAttacks)(BigInt(index), occupancyBoards[bit_boards_1.Side.both]) & (pieceBoards[bit_boards_1.Pieces.r] | pieceBoards[bit_boards_1.Pieces.q]))
            return true;
        if (knight_1.KnightAttackTables[index] & pieceBoards[bit_boards_1.Pieces.n])
            return true;
        if (pawn_1.PawnAttackTables[bit_boards_1.Side.white][index] & pieceBoards[bit_boards_1.Pieces.p])
            return true;
        if (king_1.KingAttackTables[index] & pieceBoards[bit_boards_1.Pieces.k])
            return true;
    }
    return false;
}
function PrintAttackedSquare(game, side) {
    let board = "";
    board += "    a  b  c  d  e  f  g  h\n";
    for (let rank = 0; rank < 8; rank++) {
        board += (8 - rank) + "   ";
        for (let file = 0; file < 8; file++) {
            board += (IsSquareAttacked(game.PieceBitboards, game.OccupancyBoards, rank * 8 + file, side) ? "1" : "0") + "  ";
        }
        board += "\n";
    }
    console.log(board);
}
function IsKingInCheck(game, checkedBy) {
    let kingBoard = checkedBy ? game.PieceBitboards[bit_boards_1.Pieces.K] : game.PieceBitboards[bit_boards_1.Pieces.k];
    let kingIndex = Number((0, bit_operations_1.CountSetBit)((kingBoard & -kingBoard) - 1n));
    if (IsSquareAttacked(game.PieceBitboards, game.OccupancyBoards, kingIndex, checkedBy)) {
        return kingIndex;
    }
    return -1;
}
