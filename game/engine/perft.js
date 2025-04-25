"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Perft = Perft;
exports.Divide = Divide;
const movegen_1 = require("../moves/movegen");
const game_1 = require("./game");
const move_1 = require("../moves/move");
const execute_move_1 = require("../moves/execute_move");
function Perft(game, depth) {
    let i;
    let nodes = 0;
    let moveList = (0, movegen_1.GenerateMoves)(game);
    if (depth == 1) {
        return moveList.count;
    }
    if (depth == 0) {
        return 1;
    }
    for (i = 0; i < moveList.count; i++) {
        let GameCopy = structuredClone(game);
        game = (0, execute_move_1.ExecuteMove)(game, moveList.moves[i]);
        nodes += Perft(game, depth - 1);
        game = GameCopy;
    }
    return nodes;
}
function Divide(FEN, depth) {
    // @ts-ignore
    let game = (0, game_1.NewGame)(FEN).GameState;
    let total = 0;
    let moveList = (0, movegen_1.GenerateMoves)(game);
    for (let i = 0; i < moveList.count; i++) {
        let GameCopy = structuredClone(game);
        GameCopy = (0, execute_move_1.ExecuteMove)(GameCopy, moveList.moves[i]);
        let nodes_at = Perft(GameCopy, depth - 1);
        console.log((0, move_1.GenMoveString)(moveList.moves[i]) + ": " + nodes_at);
        total += nodes_at;
    }
    console.log("Node searched:", total);
}
