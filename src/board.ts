import { Coordinates, coordinates_eq} from "./coordinates.ts";

export enum Color { White, Black }

export enum Piece { Pawn, Knight, Bishop, Rook, Queen, King }
export type BoardPiece = { piece: Piece, color: Color, square: Coordinates }
export type CastlingRights = {
    white_kingside: boolean,
    white_queenside: boolean,
    black_kingside: boolean,
    black_queenside: boolean
}
export type BoardState = {
    pieces: BoardPiece[],
    en_passant_square: Coordinates | null,
    turn: Color
    castling: CastlingRights,
    halfmove_clock: number,
    fullmove_number: number,
    // Hardcoded right now to literal. But the flexibility is a bonus.
    width: 8;
    height: 8;
}


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
