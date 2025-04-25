"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteMove = ExecuteMove;
const bit_boards_1 = require("../bitboard/bit_boards");
const init_1 = require("../positions/init");
const move_1 = require("./move");
const updates_1 = require("./updates");
function ExecuteMove(gameInfo, move) {
    let game = structuredClone(gameInfo);
    let flag = (0, move_1.GetMoveFlag)(move);
    let source = BigInt((0, move_1.GetMoveSource)(move));
    let target = BigInt((0, move_1.GetMoveTarget)(move));
    game.EnPassantSquare = -1;
    let ZobristHash = game.PastPositions[0];
    if (game.SideToMove === bit_boards_1.Side.black)
        game.FullMoves++;
    let movePiece = (0, move_1.GivenSquarePiece)(source, game.PieceBitboards);
    if (game.CastlingRight & 0b0011) {
        if (movePiece === bit_boards_1.Pieces.K) {
            game.CastlingRight &= 0b1100;
            if (game.CastlingRight & bit_boards_1.CastlingRights.WhiteKing) {
                ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[0];
            }
            if (game.CastlingRight & bit_boards_1.CastlingRights.WhiteQueen) {
                ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[1];
            }
        }
        else if (movePiece === bit_boards_1.Pieces.R) {
            if (source === 63n && (game.CastlingRight & bit_boards_1.CastlingRights.WhiteKing)) {
                game.CastlingRight = game.CastlingRight & ~bit_boards_1.CastlingRights.WhiteKing;
                ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[0];
            }
            else if (source === 56n && (game.CastlingRight & bit_boards_1.CastlingRights.WhiteQueen)) {
                game.CastlingRight = game.CastlingRight & ~bit_boards_1.CastlingRights.WhiteQueen;
                ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[1];
            }
        }
    }
    if (game.CastlingRight & 0b1100) {
        if (movePiece === bit_boards_1.Pieces.k) {
            game.CastlingRight &= 0b0011;
            if (game.CastlingRight & bit_boards_1.CastlingRights.BlackKing) {
                ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[2];
            }
            if (game.CastlingRight & bit_boards_1.CastlingRights.BlackQueen) {
                ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[3];
            }
        }
        else if (movePiece === bit_boards_1.Pieces.r) {
            if (source === 7n && (game.CastlingRight & bit_boards_1.CastlingRights.BlackKing)) {
                game.CastlingRight = game.CastlingRight & ~bit_boards_1.CastlingRights.BlackKing;
                ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[2];
            }
            else if (source === 0n && (game.CastlingRight & bit_boards_1.CastlingRights.BlackQueen)) {
                game.CastlingRight = game.CastlingRight & ~bit_boards_1.CastlingRights.BlackQueen;
                ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[3];
            }
        }
    }
    if (flag === move_1.MoveFlags.capture || flag === move_1.MoveFlags.queen_promo_capture ||
        flag === move_1.MoveFlags.knight_promo_capture || flag === move_1.MoveFlags.bishop_promo_capture ||
        flag === move_1.MoveFlags.rook_promo_capture) {
        let targetPiece = (0, move_1.GivenSquarePiece)(target, game.PieceBitboards);
        if (targetPiece === bit_boards_1.Pieces.R && target === 63n && (game.CastlingRight & bit_boards_1.CastlingRights.WhiteKing)) {
            game.CastlingRight = game.CastlingRight & ~bit_boards_1.CastlingRights.WhiteKing;
            ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[0];
        }
        else if (targetPiece === bit_boards_1.Pieces.R && target === 56n && (game.CastlingRight & bit_boards_1.CastlingRights.WhiteQueen)) {
            game.CastlingRight = game.CastlingRight & ~bit_boards_1.CastlingRights.WhiteQueen;
            ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[1];
        }
        else if (targetPiece === bit_boards_1.Pieces.r && target === 7n && (game.CastlingRight & bit_boards_1.CastlingRights.BlackKing)) {
            game.CastlingRight = game.CastlingRight & ~bit_boards_1.CastlingRights.BlackKing;
            ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[2];
        }
        else if (targetPiece === bit_boards_1.Pieces.r && target === 0n && (game.CastlingRight & bit_boards_1.CastlingRights.BlackQueen)) {
            game.CastlingRight = game.CastlingRight & ~bit_boards_1.CastlingRights.BlackQueen;
            ZobristHash = ZobristHash ^ init_1.MiscellaneousKey[3];
        }
    }
    let targetPiece;
    switch (flag) {
        case move_1.MoveFlags.quiet_moves:
            if (movePiece === bit_boards_1.Pieces.P || movePiece === bit_boards_1.Pieces.p) {
                game.HalfMoves = 0;
                game.PastPositions.length = 0;
            }
            else
                game.HalfMoves++;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[movePiece][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.capture:
            targetPiece = (0, move_1.GivenSquarePiece)(target, game.PieceBitboards);
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] | (1n << (target));
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target);
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[movePiece][Number(target)] ^ init_1.PiecePositionKey[targetPiece][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.double_push:
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.EnPassantSquare = game.SideToMove ? Number(target) - 8 : Number(target) + 8;
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[movePiece][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.queen_castle:
            game.PieceBitboards[game.SideToMove ? bit_boards_1.Pieces.k : bit_boards_1.Pieces.K] = (game.PieceBitboards[game.SideToMove ? bit_boards_1.Pieces.k : bit_boards_1.Pieces.K] >> 2n) & 0x3fffffffffffffffn;
            if (!game.SideToMove) {
                game.PieceBitboards[bit_boards_1.Pieces.R] = game.PieceBitboards[bit_boards_1.Pieces.R] & ~(1n << 56n);
                game.PieceBitboards[bit_boards_1.Pieces.R] = game.PieceBitboards[bit_boards_1.Pieces.R] | (1n << (59n));
                game.OccupancyBoards[bit_boards_1.Side.white] = game.OccupancyBoards[bit_boards_1.Side.white] & ~(1n << 56n);
                game.OccupancyBoards[bit_boards_1.Side.white] = game.OccupancyBoards[bit_boards_1.Side.white] & ~(1n << 60n);
                game.OccupancyBoards[bit_boards_1.Side.white] = game.OccupancyBoards[bit_boards_1.Side.white] | (1n << (58n));
                game.OccupancyBoards[bit_boards_1.Side.white] = game.OccupancyBoards[bit_boards_1.Side.white] | (1n << (59n));
                game.CastlingRight = game.CastlingRight & 0b1100;
                game.PastPositions.length = 0;
                ZobristHash = ZobristHash ^ init_1.PiecePositionKey[bit_boards_1.Pieces.R][56] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.R][59] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.K][60] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.K][58] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4]
                    ^ init_1.MiscellaneousKey[0] ^ init_1.MiscellaneousKey[1];
                game.PastPositions.unshift(ZobristHash);
            }
            else {
                game.PieceBitboards[bit_boards_1.Pieces.r] = game.PieceBitboards[bit_boards_1.Pieces.r] & ~(1n << 0n);
                game.PieceBitboards[bit_boards_1.Pieces.r] = game.PieceBitboards[bit_boards_1.Pieces.r] | (1n << (3n));
                game.OccupancyBoards[bit_boards_1.Side.black] = game.OccupancyBoards[bit_boards_1.Side.black] & ~(1n << 0n);
                game.OccupancyBoards[bit_boards_1.Side.black] = game.OccupancyBoards[bit_boards_1.Side.black] & ~(1n << 4n);
                game.OccupancyBoards[bit_boards_1.Side.black] = game.OccupancyBoards[bit_boards_1.Side.black] | (1n << (2n));
                game.OccupancyBoards[bit_boards_1.Side.black] = game.OccupancyBoards[bit_boards_1.Side.black] | (1n << (3n));
                game.CastlingRight = game.CastlingRight & 0b0011;
                game.PastPositions.length = 0;
                ZobristHash = ZobristHash ^ init_1.PiecePositionKey[bit_boards_1.Pieces.r][0] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.r][3] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.k][4] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.k][2] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4]
                    ^ init_1.MiscellaneousKey[2] ^ init_1.MiscellaneousKey[3];
                game.PastPositions.unshift(ZobristHash);
            }
            game.HalfMoves++;
            break;
        case move_1.MoveFlags.king_castle:
            game.PieceBitboards[game.SideToMove ? bit_boards_1.Pieces.k : bit_boards_1.Pieces.K] = (game.PieceBitboards[game.SideToMove ? bit_boards_1.Pieces.k : bit_boards_1.Pieces.K] << 2n);
            if (!game.SideToMove) {
                game.PieceBitboards[bit_boards_1.Pieces.R] = game.PieceBitboards[bit_boards_1.Pieces.R] & ~(1n << 63n);
                game.PieceBitboards[bit_boards_1.Pieces.R] = game.PieceBitboards[bit_boards_1.Pieces.R] | (1n << (61n));
                game.OccupancyBoards[bit_boards_1.Side.white] = game.OccupancyBoards[bit_boards_1.Side.white] & ~(1n << 60n);
                game.OccupancyBoards[bit_boards_1.Side.white] = game.OccupancyBoards[bit_boards_1.Side.white] & ~(1n << 63n);
                game.OccupancyBoards[bit_boards_1.Side.white] = game.OccupancyBoards[bit_boards_1.Side.white] | (1n << (61n));
                game.OccupancyBoards[bit_boards_1.Side.white] = game.OccupancyBoards[bit_boards_1.Side.white] | (1n << (62n));
                game.CastlingRight = game.CastlingRight & 0b1100;
                game.PastPositions.length = 0;
                ZobristHash = ZobristHash ^ init_1.PiecePositionKey[bit_boards_1.Pieces.R][63] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.R][61] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.K][60] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.K][62] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4]
                    ^ init_1.MiscellaneousKey[0] ^ init_1.MiscellaneousKey[1];
                game.PastPositions.unshift(ZobristHash);
            }
            else {
                game.PieceBitboards[bit_boards_1.Pieces.r] = game.PieceBitboards[bit_boards_1.Pieces.r] & ~(1n << 7n);
                game.PieceBitboards[bit_boards_1.Pieces.r] = game.PieceBitboards[bit_boards_1.Pieces.r] | (1n << (5n));
                game.OccupancyBoards[bit_boards_1.Side.black] = game.OccupancyBoards[bit_boards_1.Side.black] & ~(1n << 7n);
                game.OccupancyBoards[bit_boards_1.Side.black] = game.OccupancyBoards[bit_boards_1.Side.black] & ~(1n << 4n);
                game.OccupancyBoards[bit_boards_1.Side.black] = game.OccupancyBoards[bit_boards_1.Side.black] | (1n << (5n));
                game.OccupancyBoards[bit_boards_1.Side.black] = game.OccupancyBoards[bit_boards_1.Side.black] | (1n << (6n));
                game.CastlingRight = game.CastlingRight & 0b0011;
                game.PastPositions.length = 0;
                ZobristHash = ZobristHash ^ init_1.PiecePositionKey[bit_boards_1.Pieces.r][7] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.r][5] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.k][4] ^ init_1.PiecePositionKey[bit_boards_1.Pieces.k][6] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4]
                    ^ init_1.MiscellaneousKey[2] ^ init_1.MiscellaneousKey[3];
                game.PastPositions.unshift(ZobristHash);
            }
            game.HalfMoves++;
            break;
        case move_1.MoveFlags.ep_capture:
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            let targetPosition = game.SideToMove ? target - 8n : target + 8n;
            let targetPawn = game.SideToMove ? bit_boards_1.Pieces.P : bit_boards_1.Pieces.p;
            game.PieceBitboards[targetPawn] = game.PieceBitboards[targetPawn] & ~(1n << targetPosition);
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << targetPosition);
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[movePiece][Number(target)] ^ init_1.PiecePositionKey[targetPawn][Number(targetPosition)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.knight_promotion:
            let knightType = game.SideToMove ? bit_boards_1.Pieces.n : bit_boards_1.Pieces.N;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.PieceBitboards[knightType] = game.PieceBitboards[knightType] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[knightType][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.rook_promotion:
            let rookType = game.SideToMove ? bit_boards_1.Pieces.r : bit_boards_1.Pieces.R;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.PieceBitboards[rookType] = game.PieceBitboards[rookType] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[rookType][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.bishop_promotion:
            let bishopType = game.SideToMove ? bit_boards_1.Pieces.b : bit_boards_1.Pieces.B;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.PieceBitboards[bishopType] = game.PieceBitboards[bishopType] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[bishopType][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.queen_promotion:
            let queenType = game.SideToMove ? bit_boards_1.Pieces.q : bit_boards_1.Pieces.Q;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.PieceBitboards[queenType] = game.PieceBitboards[queenType] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[queenType][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.knight_promo_capture:
            targetPiece = (0, move_1.GivenSquarePiece)(target, game.PieceBitboards);
            let kType = game.SideToMove ? bit_boards_1.Pieces.n : bit_boards_1.Pieces.N;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.PieceBitboards[kType] = game.PieceBitboards[kType] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target);
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target);
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[targetPiece][Number(target)] ^ init_1.PiecePositionKey[kType][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.rook_promo_capture:
            targetPiece = (0, move_1.GivenSquarePiece)(target, game.PieceBitboards);
            let rType = game.SideToMove ? bit_boards_1.Pieces.r : bit_boards_1.Pieces.R;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.PieceBitboards[rType] = game.PieceBitboards[rType] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target);
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target);
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[targetPiece][Number(target)] ^ init_1.PiecePositionKey[rType][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.bishop_promo_capture:
            targetPiece = (0, move_1.GivenSquarePiece)(target, game.PieceBitboards);
            let bType = game.SideToMove ? bit_boards_1.Pieces.b : bit_boards_1.Pieces.B;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.PieceBitboards[bType] = game.PieceBitboards[bType] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target);
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target);
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[targetPiece][Number(target)] ^ init_1.PiecePositionKey[bType][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
        case move_1.MoveFlags.queen_promo_capture:
            targetPiece = (0, move_1.GivenSquarePiece)(target, game.PieceBitboards);
            let qType = game.SideToMove ? bit_boards_1.Pieces.q : bit_boards_1.Pieces.Q;
            game.PieceBitboards[movePiece] = game.PieceBitboards[movePiece] & ~(1n << source);
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] & ~(1n << source);
            game.PieceBitboards[qType] = game.PieceBitboards[qType] | (1n << (target));
            game.OccupancyBoards[game.SideToMove] = game.OccupancyBoards[game.SideToMove] | (1n << (target));
            game.PieceBitboards[targetPiece] = game.PieceBitboards[targetPiece] & ~(1n << target);
            game.OccupancyBoards[1 - game.SideToMove] = game.OccupancyBoards[1 - game.SideToMove] & ~(1n << target);
            game.HalfMoves = 0;
            game.PastPositions.length = 0;
            ZobristHash = ZobristHash ^ init_1.PiecePositionKey[movePiece][Number(source)] ^ init_1.PiecePositionKey[targetPiece][Number(target)] ^ init_1.PiecePositionKey[qType][Number(target)] ^ init_1.MiscellaneousKey[game.SideToMove ? 5 : 4] ^ init_1.MiscellaneousKey[game.SideToMove ? 4 : 5];
            game.PastPositions.unshift(ZobristHash);
            break;
    }
    game.OccupancyBoards[bit_boards_1.Side.both] = (game.OccupancyBoards[bit_boards_1.Side.white] | game.OccupancyBoards[bit_boards_1.Side.black]);
    game.SideToMove = 1 - game.SideToMove;
    game.PinnedBoards[game.SideToMove] = (0, updates_1.UpdatePinnedPieces)(game, game.SideToMove);
    return game;
}
