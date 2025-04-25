"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Benchmark = Benchmark;
const game_1 = require("./game");
const perft_1 = require("./perft");
function Benchmark(FEN, depth, iterations) {
    let sum = 0;
    // @ts-ignore
    let game = (0, game_1.NewGame)(FEN).GameState;
    (0, perft_1.Perft)(game, depth);
    for (let i = 0; i < iterations; i++) {
        performance.mark('A');
        (0, perft_1.Perft)(game, depth);
        performance.mark('B');
        performance.measure('movegen', 'A', 'B');
        sum += performance.getEntriesByName('movegen')[0].duration;
        performance.clearMarks();
        performance.clearMeasures();
    }
    console.log("Average: " + (sum / iterations).toFixed(3) + " ms.");
}
