"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieceSymbols = exports.PieceName = exports.Pieces = exports.CastlingRights = exports.Side = void 0;
exports.PieceOnGivenSquare = PieceOnGivenSquare;
var Side;
(function (Side) {
    Side[Side["white"] = 0] = "white";
    Side[Side["black"] = 1] = "black";
    Side[Side["both"] = 2] = "both";
})(Side || (exports.Side = Side = {}));
/*
        0001: White kingside castling.
        0010: White queenside casting.
        0100: Black kingside castling.
        1000: Black queenside castling.
*/
var CastlingRights;
(function (CastlingRights) {
    CastlingRights[CastlingRights["WhiteKing"] = 1] = "WhiteKing";
    CastlingRights[CastlingRights["WhiteQueen"] = 2] = "WhiteQueen";
    CastlingRights[CastlingRights["BlackKing"] = 4] = "BlackKing";
    CastlingRights[CastlingRights["BlackQueen"] = 8] = "BlackQueen";
})(CastlingRights || (exports.CastlingRights = CastlingRights = {}));
var Pieces;
(function (Pieces) {
    Pieces[Pieces["P"] = 0] = "P";
    Pieces[Pieces["N"] = 1] = "N";
    Pieces[Pieces["B"] = 2] = "B";
    Pieces[Pieces["R"] = 3] = "R";
    Pieces[Pieces["Q"] = 4] = "Q";
    Pieces[Pieces["K"] = 5] = "K";
    Pieces[Pieces["p"] = 6] = "p";
    Pieces[Pieces["n"] = 7] = "n";
    Pieces[Pieces["b"] = 8] = "b";
    Pieces[Pieces["r"] = 9] = "r";
    Pieces[Pieces["q"] = 10] = "q";
    Pieces[Pieces["k"] = 11] = "k";
})(Pieces || (exports.Pieces = Pieces = {}));
exports.PieceName = "PNBRQKpnbrqk";
exports.PieceSymbols = "♟♞♝♜♛♚♙♘♗♖♕♔";
function PieceOnGivenSquare(index, bitboards) {
    let bit_check = 1n << index;
    for (let i = 0; i < 12; i++) {
        if (bitboards[i] & bit_check)
            return i;
    }
}
