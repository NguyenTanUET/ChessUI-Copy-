"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CastlingMoves = CastlingMoves;
const bit_boards_1 = require("../bitboard/bit_boards");
const consts_1 = require("../pieces/consts");
const attacks_1 = require("./attacks");
const move_1 = require("./move");
function CastlingMoves(castlingRights, pieceBoards, occupancy, side, moveList) {
    if (!side) {
        if ((0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 60, bit_boards_1.Side.black))
            return;
        if (castlingRights & bit_boards_1.CastlingRights.WhiteKing) {
            if (!(occupancy[bit_boards_1.Side.both] & consts_1.KingsideWhite)) {
                if (!(0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 61, bit_boards_1.Side.black) &&
                    !(0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 62, bit_boards_1.Side.black)) {
                    moveList.moves[moveList.count++] = (0, move_1.MakeMove)(60, 62, move_1.MoveFlags.king_castle);
                }
            }
        }
        if (castlingRights & bit_boards_1.CastlingRights.WhiteQueen) {
            if (!(occupancy[bit_boards_1.Side.both] & consts_1.QueensideWhite)) {
                if (!(0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 58, bit_boards_1.Side.black) &&
                    !(0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 59, bit_boards_1.Side.black)) {
                    moveList.moves[moveList.count++] = (0, move_1.MakeMove)(60, 58, move_1.MoveFlags.queen_castle);
                }
            }
        }
    }
    else {
        if ((0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 4, bit_boards_1.Side.white))
            return;
        if (castlingRights & bit_boards_1.CastlingRights.BlackKing) {
            if (!(occupancy[bit_boards_1.Side.both] & consts_1.KingsideBlack)) {
                if (!(0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 5, bit_boards_1.Side.white) &&
                    !(0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 6, bit_boards_1.Side.white)) {
                    moveList.moves[moveList.count++] = (0, move_1.MakeMove)(4, 6, move_1.MoveFlags.king_castle);
                }
            }
        }
        if (castlingRights & bit_boards_1.CastlingRights.BlackQueen) {
            if (!(occupancy[bit_boards_1.Side.both] & consts_1.QueensideBlack)) {
                if (!(0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 2, bit_boards_1.Side.white) &&
                    !(0, attacks_1.IsSquareAttacked)(pieceBoards, occupancy, 3, bit_boards_1.Side.white)) {
                    moveList.moves[moveList.count++] = (0, move_1.MakeMove)(4, 2, move_1.MoveFlags.queen_castle);
                }
            }
        }
    }
}
