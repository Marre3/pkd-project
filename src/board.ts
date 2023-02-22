import { coordinates_eq, make_coordinates } from "./coordinates.ts";
import { BoardPiece, Coordinates, BoardState, Color, Piece, Move } from "./game_types.ts";
import { is_check, get_piece_moves } from "./moves.ts";

export function get_piece_by_square(coordinates: Coordinates, state: BoardState): BoardPiece | null {
    return state.pieces.find(
        (piece) => coordinates_eq(piece.square, coordinates)
    ) || null
}

export function is_piece(piece: BoardPiece | null): piece is BoardPiece {
    return piece != null
}

export function square_has_piece(coordinates: Coordinates, state: BoardState, color?: Color): boolean {
    const square_piece = get_piece_by_square(coordinates, state)
    return is_piece(square_piece) && (typeof color === "undefined" || square_piece.color == color)
}

export function other_color(color: Color): Color {
    return color == Color.Black ? Color.White : Color.Black
}

export function get_player_pieces(state: BoardState, color: Color): BoardPiece[] {
    return state.pieces.filter((piece) => piece.color === color)
}

export function get_king_position(state: BoardState, color: Color): Coordinates {
    for (const piece of state.pieces) {
        if (piece.piece == Piece.King && piece.color == color) {
            return piece.square
        }
    }
    throw new Error(`Invalid board position, no king found! State: ${state}, color: ${color}`)
}

export function is_rook(piece: BoardPiece): boolean {
    return piece.piece == Piece.Rook
}

export function is_bishop(piece: BoardPiece): boolean {
    return piece.piece == Piece.Bishop
}

export function is_queen(piece: BoardPiece): boolean {
    return piece.piece == Piece.Queen
}

export function is_knight(piece: BoardPiece): boolean {
    return piece.piece == Piece.Knight
}

export function is_king(piece: BoardPiece): boolean {
    return piece.piece == Piece.King
}

export function is_pawn(piece: BoardPiece): boolean {
    return piece.piece == Piece.Pawn
}

export function out_of_bounds(state: BoardState, coordinates: Coordinates) {
    return coordinates.x < 1 || coordinates.x > state.width || coordinates.y < 1 || coordinates.y > state.height
}

export function is_square_controlled_by(state: BoardState, square: Coordinates, color: Color) {
    function squares_controlled_by_piece(board_state: BoardState, piece: BoardPiece): Coordinates[] {
        const new_state = structuredClone(board_state)
        new_state.pieces = new_state.pieces.filter((p: BoardPiece) => !coordinates_eq(p.square, piece.square))

        if (piece.piece !== Piece.King && is_check(new_state, board_state.turn)) {
            return []
        }

        if (piece.piece === Piece.Pawn) {
            const first_pawn_square = make_coordinates(
                piece.square.x - 1,
                color === Color.White ? piece.square.y + 1 : piece.square.y - 1
            )
            const second_pawn_square = make_coordinates(
                piece.square.x + 1,
                color === Color.White ? piece.square.y + 1 : piece.square.y - 1
            )
            return [first_pawn_square, second_pawn_square]
        }

        if (piece.piece === Piece.King) {
            return get_piece_moves(piece, board_state)
                .filter((m: Move) => !(m.is_castling_kingside || m.is_castling_queenside))
                .map((m: Move) => m.to)
        }

        return get_piece_moves(piece, board_state).map((m: Move) => m.to)
    }

    if (color === state.turn) {
        return get_player_pieces(state, state.turn)
            .flatMap(piece => squares_controlled_by_piece(state, piece))
            .some(controlled_square => coordinates_eq(controlled_square, square))
    } else {
        const other_color_state = structuredClone(state)
        other_color_state.turn = other_color(state.turn)
        return get_player_pieces(other_color_state, other_color_state.turn)
            .flatMap(piece => squares_controlled_by_piece(state, piece))
            .some(controlled_square => coordinates_eq(controlled_square, square))
    }
}