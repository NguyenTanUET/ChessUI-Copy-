"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveFlags = exports.MoveFlagsMask = exports.ToSquareMask = exports.FromSquareMask = void 0;
exports.MakeMove = MakeMove;
exports.GetMoveSource = GetMoveSource;
exports.GetMoveTarget = GetMoveTarget;
exports.GetMoveFlag = GetMoveFlag;
exports.GivenSquarePiece = GivenSquarePiece;
exports.MoveCapture = MoveCapture;
exports.MovePromotion = MovePromotion;
exports.GenMoveString = GenMoveString;
exports.PrintMove = PrintMove;
const conversions_1 = require("../bitboard/conversions");
const bit_boards_1 = require("../bitboard/bit_boards");
exports.FromSquareMask = 0x3f;
exports.ToSquareMask = 0xfc0;
exports.MoveFlagsMask = 0xf000;
var MoveFlags;
(function (MoveFlags) {
    MoveFlags[MoveFlags["quiet_moves"] = 0] = "quiet_moves";
    MoveFlags[MoveFlags["double_push"] = 1] = "double_push";
    MoveFlags[MoveFlags["king_castle"] = 2] = "king_castle";
    MoveFlags[MoveFlags["queen_castle"] = 3] = "queen_castle";
    MoveFlags[MoveFlags["capture"] = 4] = "capture";
    MoveFlags[MoveFlags["ep_capture"] = 5] = "ep_capture";
    MoveFlags[MoveFlags["knight_promotion"] = 8] = "knight_promotion";
    MoveFlags[MoveFlags["bishop_promotion"] = 9] = "bishop_promotion";
    MoveFlags[MoveFlags["rook_promotion"] = 10] = "rook_promotion";
    MoveFlags[MoveFlags["queen_promotion"] = 11] = "queen_promotion";
    MoveFlags[MoveFlags["knight_promo_capture"] = 12] = "knight_promo_capture";
    MoveFlags[MoveFlags["bishop_promo_capture"] = 13] = "bishop_promo_capture";
    MoveFlags[MoveFlags["rook_promo_capture"] = 14] = "rook_promo_capture";
    MoveFlags[MoveFlags["queen_promo_capture"] = 15] = "queen_promo_capture";
})(MoveFlags || (exports.MoveFlags = MoveFlags = {}));
function MakeMove(source, target, flag) {
    return source | target << 6 | flag << 12;
}
function GetMoveSource(move) {
    return move & exports.FromSquareMask;
}
function GetMoveTarget(move) {
    return (move & exports.ToSquareMask) >>> 6;
}
function GetMoveFlag(move) {
    return (move & exports.MoveFlagsMask) >>> 12;
}
function GivenSquarePiece(index, bitboards) {
    let bit_check = 1n << index;
    for (let i = 0; i < 12; i++) {
        if (bitboards[i] & bit_check)
            return i;
    }
    return -1;
}
function MoveCapture(move) {
    return ((move & exports.MoveFlagsMask) >>> 12 & MoveFlags.capture & MoveFlags.ep_capture & MoveFlags.bishop_promo_capture &
        MoveFlags.knight_promo_capture & MoveFlags.queen_promo_capture & MoveFlags.rook_promo_capture) !== 0;
}
function MovePromotion(move, side = 1) {
    let flag = (move & exports.MoveFlagsMask) >>> 12;
    if (flag === MoveFlags.bishop_promotion || flag === MoveFlags.bishop_promo_capture) {
        return side ? bit_boards_1.Pieces.b : bit_boards_1.Pieces.B;
    }
    if (flag === MoveFlags.rook_promotion || flag === MoveFlags.rook_promo_capture) {
        return side ? bit_boards_1.Pieces.r : bit_boards_1.Pieces.R;
    }
    if (flag === MoveFlags.knight_promotion || flag === MoveFlags.knight_promo_capture) {
        return side ? bit_boards_1.Pieces.n : bit_boards_1.Pieces.N;
    }
    if (flag === MoveFlags.queen_promotion || flag === MoveFlags.queen_promo_capture) {
        return side ? bit_boards_1.Pieces.q : bit_boards_1.Pieces.Q;
    }
    return 0;
}
function IsCastling(move) {
    let flag = (move & exports.MoveFlagsMask) >>> 12;
    if (flag === MoveFlags.king_castle)
        return 1;
    else if (flag === MoveFlags.queen_castle)
        return -1;
    return 0;
}
function GenMoveString(move) {
    let moveString = "";
    let promotion = MovePromotion(move);
    moveString += (0, conversions_1.IndexToAlgebraic)(BigInt(GetMoveSource(move)));
    moveString += (0, conversions_1.IndexToAlgebraic)(BigInt(GetMoveTarget(move)));
    if (promotion !== 0)
        moveString += bit_boards_1.PieceName.charAt(promotion);
    return moveString;
}
function PrintMove(move, side, pieceBoards) {
    let moveString = "";
    if (IsCastling(move) === 1) {
        moveString += "0-0";
    }
    else if (IsCastling(move) === -1) {
        moveString += "0-0-0";
    }
    else {
        let promotion = MovePromotion(move, side);
        moveString += bit_boards_1.PieceName.charAt(GivenSquarePiece(BigInt(move), pieceBoards));
        moveString += (0, conversions_1.IndexToAlgebraic)(BigInt(GetMoveSource(move)));
        if (MoveCapture(move))
            moveString += "x";
        moveString += (0, conversions_1.IndexToAlgebraic)(BigInt(GetMoveTarget(move)));
        if (promotion !== 0)
            moveString += bit_boards_1.PieceName.charAt(promotion);
        if (((move & exports.MoveFlagsMask) >>> 12) == 5)
            moveString += "e.p";
    }
    console.log(moveString);
}
