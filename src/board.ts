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

/**
 * Get the piece located on a given square, or null if the square is empty
 * @param coordinates - The coordinates to check
 * @param state - The BoardState to search for the piece
 * @returns the piece on the given square, or null
 */
export function get_piece_by_square(
    coordinates: Coordinates,
    state: BoardState
): BoardPiece | null {
    return state.pieces.find(
        (piece) => coordinates_eq(piece.square, coordinates)
    ) || null
}

/**
 * Check if an optional BoardPiece is a BoardPiece or if it is null
 * @param piece - The optional BoardPiece
 * @returns - True if piece is a BoardPiece, false otherwise
 */
export function is_piece(piece: BoardPiece | null): piece is BoardPiece {
    return piece != null
}

/**
 * Check if a square of the chessboard has a piece,
 * optionally check only for pieces of a specific color
 * @param coordinates - The coordinates of the square to check
 * @param state - The BoardState to search for a piece
 * @param color - Optional Color of pieces to restrict the search to
 * @returns - true if the square has a piece, false otherwise
 */
export function square_has_piece(
    coordinates: Coordinates,
    state: BoardState,
    color?: Color
): boolean {
    const square_piece = get_piece_by_square(coordinates, state)
    return is_piece(square_piece)
        && (typeof color === "undefined" || square_piece.color == color)
}

/**
 * Get the opposite color, i.e. Black -> White and White -> Black
 * @param color - The color to get the opposite of
 * @returns - The opposite color of the given color
 */
export function other_color(color: Color): Color {
    return color == Color.Black ? Color.White : Color.Black
}

/**
 * Get an array of a given player's pieces
 * @param state - The BoardState to get pieces from
 * @param color - The color of the player whose pieces should be returned
 * @returns - All pieces that belong to the given player
 */
export function get_player_pieces(
    state: BoardState,
    color: Color
): BoardPiece[] {
    return state.pieces.filter((piece) => piece.color === color)
}

/**
 * Get the position of the given player's king
 * @param state - The BoardState to search for the king
 * @param color - The color of player whose king should be found
 * @returns - The coordinates of the given player's king
 * @throws If the player's king can not be found on the board, throws an error.
 */
export function get_king_position(
    state: BoardState,
    color: Color
): Coordinates {
    for (const piece of state.pieces) {
        if (piece.piece == Piece.King && piece.color == color) {
            return piece.square
        }
    }
    throw new Error(
        `Invalid board state, no king found! State: ${state}, color: ${color}`
    )
}

/**
 * Check if the given piece is a rook
 * @param piece - the piece to check
 * @returns true if the piece is a rook, false otherwise
 */
export function is_rook(piece: BoardPiece): boolean {
    return piece.piece == Piece.Rook
}

/**
 * Check if the given piece is a bishop
 * @param piece - the piece to check
 * @returns true if the piece is a bishop, false otherwise
 */
export function is_bishop(piece: BoardPiece): boolean {
    return piece.piece == Piece.Bishop
}

/**
 * Check if the given piece is a queen
 * @param piece - the piece to check
 * @returns true if the piece is a queen, false otherwise
 */
export function is_queen(piece: BoardPiece): boolean {
    return piece.piece == Piece.Queen
}

/**
 * Check if the given piece is a knight
 * @param piece - the piece to check
 * @returns true if the piece is a knight, false otherwise
 */
export function is_knight(piece: BoardPiece): boolean {
    return piece.piece == Piece.Knight
}

/**
 * Check if the given piece is a king
 * @param piece - the piece to check
 * @returns true if the piece is a king, false otherwise
 */
export function is_king(piece: BoardPiece): boolean {
    return piece.piece == Piece.King
}

/**
 * Check if the given coordinates are outside the chessboard
 * @param state - The state of the chessboard
 * @param coordinates - The Coordinates to consider
 * @returns - true if the coordinates are
 *            outside the chessboard, false otherwise
 */
export function out_of_bounds(state: BoardState, coordinates: Coordinates) {
    return coordinates.x < 1
        || coordinates.x > state.width
        || coordinates.y < 1
        || coordinates.y > state.height
}
