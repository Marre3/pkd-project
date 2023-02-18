import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { export_to_fen, get_default_board, get_legal_moves, position_from_fen, move_to_algebraic_notation, make_coordinates, Piece } from './chess.ts'

Deno.test("basic_fen", () => {
    const board = position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    assertEquals(board.pieces.length, 32)
    assertEquals(board.en_passant_square, null)
})

Deno.test("export_starting_position", () => {
    const starting_position_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    const board = position_from_fen(starting_position_fen)
    assertEquals(export_to_fen(board), starting_position_fen)
})

Deno.test("starting_position_number_of_moves", () => {
    const board = get_default_board()
    assertEquals(get_legal_moves(board).length, 20)
})

Deno.test("starting_position_move_notation", () => {
    const board = get_default_board()
    const nf3 = move_to_algebraic_notation(board, { from: make_coordinates(7, 1), to: make_coordinates(6, 3), piece_type: Piece.Knight, is_castling: false, is_en_passant: false })
    const d4 = move_to_algebraic_notation(board, { from: make_coordinates(4, 2), to: make_coordinates(4, 4), piece_type: Piece.Pawn, is_castling: false, is_en_passant: false })
    const d5_invalid = move_to_algebraic_notation(board, { from: make_coordinates(4, 7), to: make_coordinates(4, 5), piece_type: Piece.Pawn, is_castling: false, is_en_passant: false })

    assertEquals(nf3, "Nf3")
    assertEquals(d4, "d4")
    assertEquals(d5_invalid, null)
})