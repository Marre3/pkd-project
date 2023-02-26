import { test, expect } from '@jest/globals'
import { export_to_fen, position_from_fen } from "everything";

test("import_starting_position", () => {
    const board = position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    expect(board.pieces.length).toBe(32)
    expect(board.en_passant_square).toBeNull()
})

test("export_starting_position", () => {
    const starting_position_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    const board = position_from_fen(starting_position_fen)
    expect(export_to_fen(board)).toBe(starting_position_fen)
})

test("export_en_passant", () => {
    const fen = "rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3"
    expect(export_to_fen(position_from_fen(fen))).toBe(fen)
})
