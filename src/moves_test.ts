import { assert } from "https://deno.land/std@0.177.0/testing/asserts.ts";

import { Color, Move } from "./game_types.ts"
import { is_check, is_checkmate, is_self_check, is_stalemate } from "./moves.ts";
import { position_from_fen } from "./fen.ts";
import { other_color } from "./board.ts";
import { is_game_over } from "./game.ts";

Deno.test("is_check_bogo_indian", () => {
    const board = position_from_fen("rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 3 4")
    assert(is_check(board, Color.White))
    const board2 = structuredClone(board)
    board2.turn = other_color(board2.turn)
    assert(is_check(board2, Color.White))
})

Deno.test("is_check_scholars", () => {
    const board = position_from_fen("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
    assert(is_check(board, Color.Black))
    const board2 = structuredClone(board)
    board2.turn = other_color(board2.turn)
    assert(is_check(board2, Color.Black))
})

Deno.test("is_self_check_h5_scholars", () => {
    const board = position_from_fen("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
    const move: Move = {
        from: { x: 8, y: 7 },
        to: { x: 8, y: 5 },
        piece_type: 0,
        is_castling: false,
        is_en_passant: false
    } // h5
    assert(is_self_check(board, move))
})

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
