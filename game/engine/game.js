"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FENStart = void 0;
exports.NewGame = NewGame;
exports.PrintGameState = PrintGameState;
const bit_boards_1 = require("../bitboard/bit_boards");
const parse_1 = require("../fen/parse");
exports.FENStart = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
function NewGame(FEN) {
    let game = {
        GameState: {
            PieceBitboards: new BigUint64Array(12),
            OccupancyBoards: new BigUint64Array(3),
            PinnedBoards: new BigUint64Array(2),
            SideToMove: 0,
            EnPassantSquare: -1,
            CastlingRight: new Uint8Array([0b1111])[0],
            HalfMoves: 0,
            FullMoves: 1,
            PastPositions: new Array()
        },
        LegalMoveList: { moves: new Uint16Array(218), count: 0 }
    };
    if ((0, parse_1.ParseFEN)(game.GameState, FEN) !== -1) {
        return game;
    }
    else
        return null;
}
function PrintGameState(game) {
    let bitboards = game.PieceBitboards;
    let board = "";
    board += "    a b c d e f g h\n";
    for (let rank = 0; rank < 8; rank++) {
        board += (8 - rank) + "   ";
        for (let file = 0; file < 8; file++) {
            let index = rank * 8 + file;
            if (game.EnPassantSquare !== -1 && game.EnPassantSquare === index) {
                board += "x ";
                continue;
            }
            let piece = false;
            for (let i = 0; i < 12; i++) {
                if ((bitboards[i] >> BigInt(index)) & 1n) {
                    board += bit_boards_1.PieceSymbols[i] + " ";
                    piece = true;
                    break;
                }
            }
            if (!piece) {
                board += ". ";
            }
        }
        board += "\n";
    }
    board += "Castling rights: " +
        ((game.CastlingRight & 1) ? "K" : "-") +
        (((game.CastlingRight >>> 1) & 1) ? "Q" : "-") +
        (((game.CastlingRight >>> 2) & 1) ? "k" : "-") +
        (((game.CastlingRight >>> 3) & 1) ? "q" : "-") + " | ";
    board += (game.SideToMove ? "Black" : "White") + " to move | ";
    board += "Half moves: " + game.HalfMoves + " | Full moves: " + game.FullMoves;
    console.log(board);
}
