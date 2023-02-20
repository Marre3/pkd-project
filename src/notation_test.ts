import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { get_default_board } from "./chess.ts";
import { make_coordinates } from "./coordinates.ts";
import { Piece } from "./game_types.ts";
import { move_to_algebraic_notation } from "./notation.ts";


Deno.test("starting_position_move_notation", () => {
    const board = get_default_board()
    const nf3 = move_to_algebraic_notation(
        board,
        {
            from: make_coordinates(7, 1),
            to: make_coordinates(6, 3),
            piece_type: Piece.Knight,
            is_capture: false,
            is_castling: false,
            is_en_passant: false
        }
    )
    const d4 = move_to_algebraic_notation(
        board,
        {
            from:
            make_coordinates(4, 2),
            to: make_coordinates(4, 4),
            piece_type: Piece.Pawn,
            is_capture: false,
            is_castling: false,
            is_en_passant: false
        }
    )

    assertEquals(nf3, "Nf3")
    assertEquals(d4, "d4")
})
