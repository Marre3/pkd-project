import { test, expect } from '@jest/globals'
import { get_default_board, make_coordinates, Piece, move_to_algebraic_notation } from "everything";

test("starting_position_move_notation", () => {
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

    expect(nf3).toBe("Nf3")
    expect(d4).toBe("d4")
})
