"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashFromState = HashFromState;
const init_1 = require("./init");
const bit_operations_1 = require("../bitboard/bit_operations");
const bit_boards_1 = require("../bitboard/bit_boards");
const move_1 = require("../moves/move");
// Return the Zobrist hash of the current game state.
function HashFromState(game) {
    let hash = game.SideToMove ? init_1.MiscellaneousKey[5] : init_1.MiscellaneousKey[4];
    if (game.CastlingRight & 0b0001) {
        hash = hash ^ init_1.MiscellaneousKey[0];
    }
    if (game.CastlingRight & 0b0010) {
        hash = hash ^ init_1.MiscellaneousKey[1];
    }
    if (game.CastlingRight & 0b0100) {
        hash = hash ^ init_1.MiscellaneousKey[2];
    }
    if (game.CastlingRight & 0b1000) {
        hash = hash ^ init_1.MiscellaneousKey[3];
    }
    if (!game.SideToMove) {
        hash = hash ^ init_1.MiscellaneousKey[4];
    }
    else {
        hash = hash ^ init_1.MiscellaneousKey[5];
    }
    let occupancy = game.OccupancyBoards[bit_boards_1.Side.both];
    while (occupancy) {
        let index = (0, bit_operations_1.CountSetBit)((occupancy & -occupancy) - 1n);
        let piece = (0, move_1.GivenSquarePiece)(index, game.PieceBitboards);
        hash = hash ^ init_1.PiecePositionKey[piece][Number(index)];
        occupancy = occupancy & (occupancy - 1n);
    }
    return hash;
}
