"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePinnedPieces = UpdatePinnedPieces;
exports.CheckingPieces = CheckingPieces;
const bit_operations_1 = require("../bitboard/bit_operations");
const bit_boards_1 = require("../bitboard/bit_boards");
const rook_1 = require("../pieces/rook");
const bishop_1 = require("../pieces/bishop");
const consts_1 = require("../bitboard/consts");
const knight_1 = require("../pieces/knight");
const pawn_1 = require("../pieces/pawn");
function UpdatePinnedPieces(game, pinnedSide) {
    let kingIndex = (0, bit_operations_1.CountSetBit)((game.PieceBitboards[pinnedSide ? bit_boards_1.Pieces.k : bit_boards_1.Pieces.K] & -game.PieceBitboards[pinnedSide ? bit_boards_1.Pieces.k : bit_boards_1.Pieces.K]) - 1n);
    let attack_map = ((0, rook_1.GetRookAttacks)(kingIndex, game.OccupancyBoards[1 - pinnedSide]) & (game.PieceBitboards[pinnedSide ? bit_boards_1.Pieces.R : bit_boards_1.Pieces.r] | game.PieceBitboards[pinnedSide ? bit_boards_1.Pieces.Q : bit_boards_1.Pieces.q]))
        | ((0, bishop_1.GetBishopAttacks)(kingIndex, game.OccupancyBoards[1 - pinnedSide]) & (game.PieceBitboards[pinnedSide ? bit_boards_1.Pieces.B : bit_boards_1.Pieces.b] | game.PieceBitboards[pinnedSide ? bit_boards_1.Pieces.Q : bit_boards_1.Pieces.q]));
    let pinned_map = 0n;
    while (attack_map) {
        let sniper = (0, bit_operations_1.CountSetBit)((attack_map & -attack_map) - 1n);
        let intersection = consts_1.LinesBetween[Number(sniper)][Number(kingIndex)] & game.OccupancyBoards[pinnedSide];
        if ((0, bit_operations_1.CountSetBit)(intersection) === 1n) {
            pinned_map |= intersection;
        }
        attack_map = attack_map & (attack_map - 1n);
    }
    return pinned_map;
}
function CheckingPieces(pieceBitboards, occupancyBoards, kingIndex, sideToMove) {
    return (knight_1.KnightAttackTables[kingIndex] & pieceBitboards[!sideToMove ? bit_boards_1.Pieces.n : bit_boards_1.Pieces.N])
        | (pawn_1.PawnAttackTables[sideToMove][kingIndex] & pieceBitboards[!sideToMove ? bit_boards_1.Pieces.p : bit_boards_1.Pieces.P])
        | ((0, rook_1.GetRookAttacks)(BigInt(kingIndex), occupancyBoards[bit_boards_1.Side.both]) & (pieceBitboards[!sideToMove ? bit_boards_1.Pieces.r : bit_boards_1.Pieces.R] | pieceBitboards[!sideToMove ? bit_boards_1.Pieces.q : bit_boards_1.Pieces.Q]))
        | ((0, bishop_1.GetBishopAttacks)(BigInt(kingIndex), occupancyBoards[bit_boards_1.Side.both]) & (pieceBitboards[!sideToMove ? bit_boards_1.Pieces.b : bit_boards_1.Pieces.B] | pieceBitboards[!sideToMove ? bit_boards_1.Pieces.q : bit_boards_1.Pieces.Q]));
}
