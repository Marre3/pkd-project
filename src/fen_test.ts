import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { export_to_fen, position_from_fen } from "./fen.ts";

Deno.test("import_starting_position", () => {
    const board = position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    assertEquals(board.pieces.length, 32)
    assertEquals(board.en_passant_square, null)
})

Deno.test("export_starting_position", () => {
    const starting_position_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    const board = position_from_fen(starting_position_fen)
    assertEquals(export_to_fen(board), starting_position_fen)
})

Deno.test("export_en_passant", () => {
    const fen = "rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3"
    assertEquals(export_to_fen(position_from_fen(fen)), fen)
})
