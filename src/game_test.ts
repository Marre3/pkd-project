import { assert } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { position_from_fen } from "./fen.ts";
import { is_checkmate, is_game_over, is_stalemate } from "./game.ts";

Deno.test("checkmate_scholars", () => {
    const board = position_from_fen("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
    assert(is_checkmate(board))
    assert(is_game_over(board))
})

Deno.test("stalemate_queen", () => {
    const board = position_from_fen("k7/2Q5/1K6/8/8/8/8/8 b - - 0 1")
    assert(is_stalemate(board))
    assert(is_game_over(board))
})
