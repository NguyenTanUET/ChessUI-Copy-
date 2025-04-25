"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBit = GetBit;
exports.SetBit = SetBit;
exports.ClearBit = ClearBit;
exports.CountSetBit = CountSetBit;
exports.LeastSignificantOneIndex = LeastSignificantOneIndex;
exports.RightShift = RightShift;
exports.PrintBoard = PrintBoard;
function GetBit(bitboard, index) {
    return (bitboard >> index) & 1n;
}
function SetBit(bitboard, index) {
    return bitboard | (1n << (index));
}
function ClearBit(bitboard, index) {
    return bitboard & ~(1n << index);
}
function CountSetBit(bitboard) {
    bitboard = bitboard - ((bitboard >> 1n) & 0x5555555555555555n);
    bitboard = (bitboard & 0x3333333333333333n) + ((bitboard >> 2n) & 0x3333333333333333n);
    return ((((bitboard + ((bitboard >> 4n) & 0xfffffffffffffffn)) & 0xf0f0f0f0f0f0f0fn) * 0x101010101010101n) >> 56n) & 0xffn;
}
function LeastSignificantOneIndex(bitboard) {
    return CountSetBit((bitboard & -bitboard) - 1n);
}
function RightShift(bitboard, index) {
    return (bitboard >> index) & ((1n << (64n - index)) - 1n);
}
function PrintBoard(bitboard) {
    let board = "";
    board += "    a  b  c  d  e  f  g  h\n";
    for (let rank = 0n; rank < 8n; rank++) {
        board += (8n - rank) + "   ";
        for (let file = 0n; file < 8n; file++) {
            board += ((bitboard >> rank * 8n + file) & 1n) + "  ";
        }
        board += "\n";
    }
    console.log(board);
}
