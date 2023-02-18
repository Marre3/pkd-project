import { BoardPiece,Coordinates,BoardState,Color } from "./game_types.ts";

export function get_piece_by_square(coordinates: Coordinates, state: BoardState): BoardPiece | null {
    return state.pieces.find(
        (piece) => piece.square.x == coordinates.x && piece.square.y == coordinates.y
    ) || null
}

export function is_piece(piece: BoardPiece | null): piece is BoardPiece {
    return piece != null
}

export function square_has_piece(coordinates: Coordinates, state: BoardState, color?: Color): boolean {
    const square_piece = get_piece_by_square(coordinates, state)
    return is_piece(square_piece) && (typeof color === "undefined" || square_piece.color == color)
}
