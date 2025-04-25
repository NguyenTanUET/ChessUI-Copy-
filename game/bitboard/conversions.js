"use strict";
const {MakeMove, MoveFlags} = require("../moves/move");
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlgebraicToIndex = AlgebraicToIndex;
exports.IndexToAlgebraic = IndexToAlgebraic;
exports.AlgebraicToMove = AlgebraicToMove;
function AlgebraicToIndex(algebraic) {
    let file = algebraic[0]; //File: Column a-h
    let rank = Number(algebraic[1]); //Rank: Row 1-8
    switch (file) {
        case 'a':
            return 8 * (8 - rank);
        case 'b':
            return 1 + 8 * (8 - rank);
        case 'c':
            return 2 + 8 * (8 - rank);
        case 'd':
            return 3 + 8 * (8 - rank);
        case 'e':
            return 4 + 8 * (8 - rank);
        case 'f':
            return 5 + 8 * (8 - rank);
        case 'g':
            return 6 + 8 * (8 - rank);
        case 'h':
            return 7 + 8 * (8 - rank);
    }
    return -1;
}
function IndexToAlgebraic(index) {
    return 'abcdefgh'.charAt(Number(index % 8n)) + (8n - (index / 8n));
}

function AlgebraicToMove(algebraic, legalMoveList) {
    let source = (AlgebraicToIndex)(algebraic.slice(0, 2));
    let target = (AlgebraicToIndex)(algebraic.slice(2, 4));
    if (algebraic.length === 5) {
        switch (algebraic[4]) {
            case 'q':
                if (source % 8 === target % 8)
                return (MakeMove)(source, target, MoveFlags.queen_promotion);
            else
                return (MakeMove)(source, target, MoveFlags.queen_promo_capture);
            case 'r':
                if (source % 8 === target % 8)
                return (MakeMove)(source, target, MoveFlags.rook_promotion);
            else
                return (MakeMove)(source, target, MoveFlags.rook_promo_capture);
            case 'b':
                if (source % 8 === target % 8)
                return (MakeMove)(source, target, MoveFlags.bishop_promotion);
            else
                return (MakeMove)(source, target, MoveFlags.bishop_promo_capture);
            case 'n':
                if (source % 8 === target % 8)
                return (MakeMove)(source, target, MoveFlags.knight_promotion);
            else
                return (MakeMove)(source, target, MoveFlags.knight_promo_capture);
        }
    }
    let move = (MakeMove)(source, target, MoveFlags.quiet_moves);
    return legalMoveList.moves.find((element) => (element & 0xfff) === move);
}