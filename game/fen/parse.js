"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseFEN = ParseFEN;
const conversions_1 = require("../bitboard/conversions");
const bit_boards_1 = require("../bitboard/bit_boards");
const zobrist_hashing_1 = require("../positions/zobrist_hashing");
const updates_1 = require("../moves/updates");
/*
      A FEN string contains six fields:
      0: Pieces positions.
      1: Active color.
      2: Castling availability.
      3: En passant square.
      4: Half-move clock.
      5: Full-move clock.
    */
var FENfields;
(function (FENfields) {
    FENfields[FENfields["positions"] = 0] = "positions";
    FENfields[FENfields["active_color"] = 1] = "active_color";
    FENfields[FENfields["castling"] = 2] = "castling";
    FENfields[FENfields["en_passant"] = 3] = "en_passant";
    FENfields[FENfields["half_move"] = 4] = "half_move";
    FENfields[FENfields["full_move"] = 5] = "full_move";
})(FENfields || (FENfields = {}));
function ParseFEN(game, fenString) {
    let FEN = fenString.split(" ");
    //Parse active color
    switch (FEN[FENfields.active_color]) {
        case 'w':
            game.SideToMove = bit_boards_1.Side.white;
            break;
        case 'b':
            game.SideToMove = bit_boards_1.Side.black;
            break;
        default:
            return -1;
    }
    //Parse en passant square
    if (FEN[FENfields.en_passant] !== '-') {
        let enPassantSq = (0, conversions_1.AlgebraicToIndex)(FEN[FENfields.en_passant]);
        if (enPassantSq === -1) {
            return -1;
        }
        game.EnPassantSquare = enPassantSq;
    }
    else
        game.EnPassantSquare = -1;
    //Parse half-move clock
    game.HalfMoves = parseInt(FEN[FENfields.half_move]);
    if (isNaN(game.HalfMoves)) {
        return -1;
    }
    //Parse full-move clock
    game.FullMoves = parseInt(FEN[FENfields.full_move]);
    if (isNaN(game.FullMoves)) {
        return -1;
    }
    //Parse castling rights
    if (FEN[FENfields.castling] === "-") {
        game.CastlingRight = 0;
    }
    else {
        let castling = FEN[FENfields.castling];
        let castlingRights = 0;
        for (let index = 0; index < castling.length; index++) {
            switch (castling.charAt(index)) {
                case 'K':
                    castlingRights |= 0b0001;
                    break;
                case 'Q':
                    castlingRights |= 0b0010;
                    break;
                case 'k':
                    castlingRights |= 0b0100;
                    break;
                case 'q':
                    castlingRights |= 0b1000;
                    break;
                case '-':
                    break;
                default:
                    return -1;
            }
        }
        game.CastlingRight = castlingRights;
    }
    //Parse positions
    let count = 0n;
    let positions = FEN[FENfields.positions];
    for (let index = 0; index < positions.length; index++) {
        switch (positions.charAt(index)) {
            case 'P':
                game.PieceBitboards[bit_boards_1.Pieces.P] |= (1n << (count));
                count++;
                break;
            case 'N':
                game.PieceBitboards[bit_boards_1.Pieces.N] |= (1n << (count));
                count++;
                break;
            case 'B':
                game.PieceBitboards[bit_boards_1.Pieces.B] |= (1n << (count));
                count++;
                break;
            case 'R':
                game.PieceBitboards[bit_boards_1.Pieces.R] |= (1n << (count));
                count++;
                break;
            case 'Q':
                game.PieceBitboards[bit_boards_1.Pieces.Q] |= (1n << (count));
                count++;
                break;
            case 'K':
                game.PieceBitboards[bit_boards_1.Pieces.K] |= (1n << (count));
                count++;
                break;
            case 'p':
                game.PieceBitboards[bit_boards_1.Pieces.p] |= (1n << (count));
                count++;
                break;
            case 'n':
                game.PieceBitboards[bit_boards_1.Pieces.n] |= (1n << (count));
                count++;
                break;
            case 'b':
                game.PieceBitboards[bit_boards_1.Pieces.b] |= (1n << (count));
                count++;
                break;
            case 'r':
                game.PieceBitboards[bit_boards_1.Pieces.r] |= (1n << (count));
                count++;
                break;
            case 'q':
                game.PieceBitboards[bit_boards_1.Pieces.q] |= (1n << (count));
                count++;
                break;
            case 'k':
                game.PieceBitboards[bit_boards_1.Pieces.k] |= (1n << (count));
                count++;
                break;
            case '1':
                count += 1n;
                break;
            case '2':
                count += 2n;
                break;
            case '3':
                count += 3n;
                break;
            case '4':
                count += 4n;
                break;
            case '5':
                count += 5n;
                break;
            case '6':
                count += 6n;
                break;
            case '7':
                count += 7n;
                break;
            case '8':
                count += 8n;
                break;
            case '/':
                break;
            default:
                return -1;
        }
    }
    if (count !== 64n) {
        return -1;
    }
    game.OccupancyBoards[bit_boards_1.Side.white] = (game.PieceBitboards[bit_boards_1.Pieces.P] | game.PieceBitboards[bit_boards_1.Pieces.N] | game.PieceBitboards[bit_boards_1.Pieces.B] | game.PieceBitboards[bit_boards_1.Pieces.R] | game.PieceBitboards[bit_boards_1.Pieces.Q] | game.PieceBitboards[bit_boards_1.Pieces.K]);
    game.OccupancyBoards[bit_boards_1.Side.black] = (game.PieceBitboards[bit_boards_1.Pieces.p] | game.PieceBitboards[bit_boards_1.Pieces.n] | game.PieceBitboards[bit_boards_1.Pieces.b] | game.PieceBitboards[bit_boards_1.Pieces.r] | game.PieceBitboards[bit_boards_1.Pieces.q] | game.PieceBitboards[bit_boards_1.Pieces.k]);
    game.OccupancyBoards[bit_boards_1.Side.both] = (game.OccupancyBoards[bit_boards_1.Side.white] | game.OccupancyBoards[bit_boards_1.Side.black]);
    game.PinnedBoards[1 - game.SideToMove] = (0, updates_1.UpdatePinnedPieces)(game, 1 - game.SideToMove);
    game.PinnedBoards[game.SideToMove] = (0, updates_1.UpdatePinnedPieces)(game, game.SideToMove);
    game.PastPositions.unshift((0, zobrist_hashing_1.HashFromState)(game));
    return 0;
}
