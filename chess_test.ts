import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { coordinates_from_notation, coordinates_to_notation, export_to_fen, get_default_board, get_legal_moves, make_coordinates, position_from_fen, move_to_algebraic_notation, Piece } from './chess.ts'


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

Deno.test("export_en_passant", () => {
    const fen = "rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3"
    assertEquals(export_to_fen(position_from_fen(fen)), fen)
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

Deno.test("test_coordinates_from_notation", () => {
    for (let x = 1; x <= 8; ++x) {
        for (let y = 1; y <= 8; ++y) {
            assertEquals(
                make_coordinates(x, y),
                coordinates_from_notation(
                    coordinates_to_notation(make_coordinates(x, y))
                )
            )
        }
    }
})
