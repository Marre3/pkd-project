import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { position_from_fen } from './chess.ts'

Deno.test("basic_fen", () => {
    const board = position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    assertEquals(board.pieces.length, 32)
    assertEquals(board.en_passant_square, null)
})
