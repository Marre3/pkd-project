import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { coordinates_to_notation, export_to_fen, get_default_board, get_legal_moves, make_coordinates, position_from_fen } from './chess.ts'

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

Deno.test("test_coordinates_to_notation", () => {
    assertEquals(coordinates_to_notation(make_coordinates(1, 1)), "a1")
    assertEquals(coordinates_to_notation(make_coordinates(1, 8)), "a8")
    assertEquals(coordinates_to_notation(make_coordinates(8, 8)), "h8")
    assertEquals(coordinates_to_notation(make_coordinates(8, 1)), "h1")
    assertEquals(coordinates_to_notation(make_coordinates(3, 4)), "c4")
    assertEquals(coordinates_to_notation(make_coordinates(2, 7)), "b7")
    assertEquals(coordinates_to_notation(make_coordinates(4, 4)), "d4")
    assertEquals(coordinates_to_notation(make_coordinates(5, 2)), "e2")
    assertEquals(coordinates_to_notation(make_coordinates(6, 5)), "f5")
    assertEquals(coordinates_to_notation(make_coordinates(7, 3)), "g3")
})
