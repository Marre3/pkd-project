import { assert, assertEquals, assertExists } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { get_default_board } from "./chess.ts";
import { export_to_fen, position_from_fen } from "./fen.ts";
import { apply_move_by_notation, game_result, get_move_by_notation, is_checkmate, is_game_over, is_stalemate } from "./game.ts";
import { Result } from "./game_types.ts";

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

Deno.test("en_passant_possible", () => {
    const board = position_from_fen("rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3")
    assertExists(get_move_by_notation(board, "exd6") !== null)
})

Deno.test("scholars_mate", () => {
    let board = get_default_board()
    for (const move of ["e4", "e5", "Qh5", "Nc6", "Bc4", "Nf6", "Qxf7#"]) {
        board = apply_move_by_notation(board, move)
    }
    assert(is_game_over(board))
    assert(is_checkmate(board))
    assert(! is_stalemate(board))
    assert(game_result(board) === Result["1-0"])
    assertEquals(export_to_fen(board), "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
})
