"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryMoves = TryMoves;
exports.GenerateMoves = GenerateMoves;
const bit_boards_1 = require("../bitboard/bit_boards");
const pawn_pushes_1 = require("./pawn_pushes");
const pawn_attacks_1 = require("./pawn_attacks");
const castling_1 = require("./castling");
const knight_moves_1 = require("./knight_moves");
const bishop_moves_1 = require("./bishop_moves");
const king_moves_1 = require("./king_moves");
const rook_moves_1 = require("./rook_moves");
const move_1 = require("./move");
const attacks_1 = require("./attacks");
const execute_move_1 = require("./execute_move");
const bit_operations_1 = require("../bitboard/bit_operations");
const consts_1 = require("../bitboard/consts");
const updates_1 = require("./updates");
function TryMoves(game, pseudoLegalMoves) {
    let LegalMoves = {
        count: 0,
        moves: new Uint16Array(218)
    };
    let movePiece;
    let move, kingIndex = (0, attacks_1.IsKingInCheck)(game, 1 - game.SideToMove);
    let kingBoard = game.SideToMove ? bit_boards_1.Pieces.k : bit_boards_1.Pieces.K;
    if (kingIndex !== -1) {
        let checkingBoard = (0, updates_1.CheckingPieces)(game.PieceBitboards, game.OccupancyBoards, kingIndex, game.SideToMove);
        for (let i = 0; i < pseudoLegalMoves.count; i++) {
            move = pseudoLegalMoves.moves[i];
            movePiece = (0, move_1.GivenSquarePiece)(BigInt((0, move_1.GetMoveSource)(move)), game.PieceBitboards);
            if (movePiece === kingBoard) {
                let gameCopy = (0, execute_move_1.ExecuteMove)(game, move);
                if ((0, attacks_1.IsKingInCheck)(gameCopy, gameCopy.SideToMove) === -1) {
                    LegalMoves.moves[LegalMoves.count++] = move;
                }
            }
        }
        switch ((0, bit_operations_1.CountSetBit)(checkingBoard)) {
            case 2n:
                break;
            case 1n:
                let checker_position = (0, bit_operations_1.CountSetBit)((checkingBoard & -checkingBoard) - 1n);
                switch ((0, bit_boards_1.PieceOnGivenSquare)(checker_position, game.PieceBitboards)) {
                    case bit_boards_1.Pieces.p:
                    case bit_boards_1.Pieces.P:
                        for (let i = 0; i < pseudoLegalMoves.count; i++) {
                            move = pseudoLegalMoves.moves[i];
                            movePiece = (0, move_1.GivenSquarePiece)(BigInt((0, move_1.GetMoveSource)(move)), game.PieceBitboards);
                            if (movePiece === kingBoard)
                                continue;
                            if (game.PinnedBoards[game.SideToMove] & (1n << BigInt((0, move_1.GetMoveSource)(move))))
                                continue;
                            let move_target = (0, move_1.GetMoveTarget)(move);
                            if (move_target === Number(checker_position)) {
                                LegalMoves.moves[LegalMoves.count++] = move;
                            }
                            else if ((0, move_1.GetMoveFlag)(move) === move_1.MoveFlags.ep_capture) {
                                if ((game.SideToMove ? move_target - 8 : move_target + 8) === Number(checker_position)) {
                                    LegalMoves.moves[LegalMoves.count++] = move;
                                }
                            }
                        }
                        break;
                    case bit_boards_1.Pieces.n:
                    case bit_boards_1.Pieces.N:
                        for (let i = 0; i < pseudoLegalMoves.count; i++) {
                            move = pseudoLegalMoves.moves[i];
                            movePiece = (0, move_1.GivenSquarePiece)(BigInt((0, move_1.GetMoveSource)(move)), game.PieceBitboards);
                            if (movePiece === kingBoard)
                                continue;
                            if (game.PinnedBoards[game.SideToMove] & (1n << BigInt((0, move_1.GetMoveSource)(move))))
                                continue;
                            if ((0, move_1.GetMoveTarget)(move) === Number(checker_position)) {
                                LegalMoves.moves[LegalMoves.count++] = move;
                            }
                        }
                        break;
                    default:
                        for (let i = 0; i < pseudoLegalMoves.count; i++) {
                            move = pseudoLegalMoves.moves[i];
                            movePiece = (0, move_1.GivenSquarePiece)(BigInt((0, move_1.GetMoveSource)(move)), game.PieceBitboards);
                            if (movePiece === kingBoard)
                                continue;
                            if (game.PinnedBoards[game.SideToMove] & (1n << BigInt((0, move_1.GetMoveSource)(move))))
                                continue;
                            let move_target = (0, move_1.GetMoveTarget)(move);
                            if (move_target === Number(checker_position)) {
                                LegalMoves.moves[LegalMoves.count++] = move;
                            }
                            else if (movePiece !== kingBoard && consts_1.LinesBetween[kingIndex][Number(checker_position)] & (1n << BigInt(move_target))) {
                                LegalMoves.moves[LegalMoves.count++] = move;
                            }
                        }
                }
        }
    }
    else
        for (let i = 0; i < pseudoLegalMoves.count; i++) {
            move = pseudoLegalMoves.moves[i];
            if ((0, move_1.GetMoveFlag)(move) === move_1.MoveFlags.ep_capture) {
                let gameCopy = (0, execute_move_1.ExecuteMove)(game, move);
                if ((0, attacks_1.IsKingInCheck)(gameCopy, gameCopy.SideToMove) === -1) {
                    LegalMoves.moves[LegalMoves.count++] = move;
                }
                continue;
            }
            movePiece = (0, move_1.GivenSquarePiece)(BigInt((0, move_1.GetMoveSource)(move)), game.PieceBitboards);
            if (movePiece === kingBoard) {
                if (!(0, attacks_1.IsSquareAttacked)(game.PieceBitboards, game.OccupancyBoards, (0, move_1.GetMoveTarget)(move), 1 - game.SideToMove)) {
                    LegalMoves.moves[LegalMoves.count++] = move;
                }
                continue;
            }
            let source = (0, move_1.GetMoveSource)(move);
            let target = (0, move_1.GetMoveTarget)(move);
            if (consts_1.LinesIntersect[source][target] & game.PieceBitboards[game.SideToMove ? bit_boards_1.Pieces.k : bit_boards_1.Pieces.K]) {
                LegalMoves.moves[LegalMoves.count++] = move;
                continue;
            }
            if (!(game.PinnedBoards[game.SideToMove] & (1n << BigInt(source)))) {
                LegalMoves.moves[LegalMoves.count++] = move;
            }
        }
    return LegalMoves;
}
function GenerateMoves(game) {
    let pieceBoard;
    let side = game.SideToMove;
    let PseudoLegalMoveList = {
        count: 0,
        moves: new Uint16Array(218)
    };
    switch (side) {
        case bit_boards_1.Side.white:
            for (let piece = 0; piece <= 5; piece++) {
                pieceBoard = game.PieceBitboards[piece];
                switch (piece) {
                    case bit_boards_1.Pieces.K:
                        (0, king_moves_1.GenerateKingMoves)(pieceBoard, game.OccupancyBoards[bit_boards_1.Side.white], game.OccupancyBoards[bit_boards_1.Side.black], PseudoLegalMoveList);
                        (0, castling_1.CastlingMoves)(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, bit_boards_1.Side.white, PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.P:
                        (0, pawn_pushes_1.GeneratePawnPushes)(pieceBoard, ~game.OccupancyBoards[bit_boards_1.Side.both], bit_boards_1.Side.white, PseudoLegalMoveList);
                        (0, pawn_attacks_1.GeneratePawnCaptures)(pieceBoard, game.OccupancyBoards[bit_boards_1.Side.black], game.EnPassantSquare, bit_boards_1.Side.white, PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.N:
                        (0, knight_moves_1.GenerateKnightMoves)(pieceBoard, game.OccupancyBoards[bit_boards_1.Side.white], game.OccupancyBoards[bit_boards_1.Side.black], PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.B:
                        (0, bishop_moves_1.GenerateBishopMoves)(pieceBoard, game.OccupancyBoards, bit_boards_1.Side.white, PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.R:
                        (0, rook_moves_1.GenerateRookMoves)(pieceBoard, game.OccupancyBoards, bit_boards_1.Side.white, PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.Q:
                        (0, bishop_moves_1.GenerateBishopMoves)(pieceBoard, game.OccupancyBoards, bit_boards_1.Side.white, PseudoLegalMoveList);
                        (0, rook_moves_1.GenerateRookMoves)(pieceBoard, game.OccupancyBoards, bit_boards_1.Side.white, PseudoLegalMoveList);
                        break;
                }
            }
            break;
        case bit_boards_1.Side.black:
            for (let piece = 6; piece <= 11; piece++) {
                pieceBoard = game.PieceBitboards[piece];
                switch (piece) {
                    case bit_boards_1.Pieces.p:
                        (0, pawn_pushes_1.GeneratePawnPushes)(pieceBoard, ~game.OccupancyBoards[bit_boards_1.Side.both], bit_boards_1.Side.black, PseudoLegalMoveList);
                        (0, pawn_attacks_1.GeneratePawnCaptures)(pieceBoard, game.OccupancyBoards[bit_boards_1.Side.white], game.EnPassantSquare, bit_boards_1.Side.black, PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.k:
                        (0, king_moves_1.GenerateKingMoves)(pieceBoard, game.OccupancyBoards[bit_boards_1.Side.black], game.OccupancyBoards[bit_boards_1.Side.white], PseudoLegalMoveList);
                        (0, castling_1.CastlingMoves)(game.CastlingRight, game.PieceBitboards, game.OccupancyBoards, bit_boards_1.Side.black, PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.n:
                        (0, knight_moves_1.GenerateKnightMoves)(pieceBoard, game.OccupancyBoards[bit_boards_1.Side.black], game.OccupancyBoards[bit_boards_1.Side.white], PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.b:
                        (0, bishop_moves_1.GenerateBishopMoves)(pieceBoard, game.OccupancyBoards, bit_boards_1.Side.black, PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.r:
                        (0, rook_moves_1.GenerateRookMoves)(pieceBoard, game.OccupancyBoards, bit_boards_1.Side.black, PseudoLegalMoveList);
                        break;
                    case bit_boards_1.Pieces.q:
                        (0, bishop_moves_1.GenerateBishopMoves)(pieceBoard, game.OccupancyBoards, bit_boards_1.Side.black, PseudoLegalMoveList);
                        (0, rook_moves_1.GenerateRookMoves)(pieceBoard, game.OccupancyBoards, bit_boards_1.Side.black, PseudoLegalMoveList);
                        break;
                }
            }
    }
    return TryMoves(game, PseudoLegalMoveList);
}
