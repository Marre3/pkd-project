import {
    BoardPiece, BoardState, Color, get_player_pieces,
    is_piece, other_color, Piece
} from "./board.ts";
import { coordinates_to_notation, file_to_character } from "./coordinates.ts";
import { is_checkmate } from "./game.ts";
import { apply_move, can_piece_move_to, is_check, Move } from "./moves.ts";

/**
 * Convert a letter (lowercase or uppercase) to its corresponding piece type
 * @example
 *  // returns Piece.Queen
 * get_piece_by_letter('Q');
 * @param letter - the letter to convert to a piece type
 * @precondition letter is either 'p', 'n', 'b', 'r', 'q' or 'k' in lowercase or uppercase
 * @returns the corresponding piece type for letter
 */
export function get_piece_by_letter(letter: string): Piece {
    letter = letter.toLowerCase()
    return letter === "p"
        ? Piece.Pawn
        : letter === "n"
        ? Piece.Knight
        : letter === "b"
        ? Piece.Bishop
        : letter === "r"
        ? Piece.Rook
        : letter === "q"
        ? Piece.Queen
        : Piece.King
}

/**
 * Convert a piece to its corresponding letter (uppercase if it's a white piece, otherwise lowercase)
 * @param board_piece - the piece to convert to a letter
 * @returns the corresponding letter to board_piece if board_piece is a BoardPiece, or '.' otherwise
 */
export function get_letter_by_piece(board_piece: BoardPiece | null): string {
    return is_piece(board_piece)
    ? get_letter_by_color(
        get_letter_by_piece_type(board_piece.piece),
        board_piece.color
    )
    : "."
}

/**
 * Convert a piece type to its corresponding letter (in uppercase)
 * @param piece - the piece type to convert to a letter
 * @returns the corresponding letter to piece
 */
export function get_letter_by_piece_type(piece: Piece): string {
    return piece === Piece.Knight
        ? "N"
        : piece === Piece.Bishop
        ? "B"
        : piece === Piece.Rook
        ? "R"
        : piece === Piece.Queen
        ? "Q"
        : piece === Piece.King
        ? "K"
        : "P"
}

/**
 * Convert a piece letter to its corresponding color (white if uppercase, otherwise black)
 * @param letter - the letter to convert to a color
 * @returns the corresponding color to letter
 */
export function get_color_by_letter(letter: string): Color {
    return letter.toLowerCase() === letter ? Color.Black : Color.White
}

/**
 * Update a letter's casing based on a given color (uppercase if white, otherwise lowercase)
 * @param letter - the letter to update
 * @param color - the color to update letter based on
 * @returns the updated letter
 */
function get_letter_by_color(letter: string, color: Color): string {
    return color === Color.White ? letter.toUpperCase() : letter.toLowerCase()
}

/**
 * Get algebraic notation of a given move in a certain BoardState
 * @param state - the BoardState to consider the move in
 * @param move - the move to get algebraic notation of
 * @returns the algebraic notation of move
 */
export function move_to_algebraic_notation(
    state: BoardState,
    move: Move
): string {
    function get_origin_square_notation(capture: boolean): string {
        const allowed_pieces = get_player_pieces(
            state, state.turn
        ).filter(
            (piece: BoardPiece) => (piece.piece === move.piece_type)
                && can_piece_move_to(state, piece, move.to)
        )
        const multiple_pieces_on_same_rank = allowed_pieces.filter(
            (piece) => piece.square.y === move.from.y
        ).length > 1
        const multiple_pieces_on_same_file = allowed_pieces.filter(
            (piece) => piece.square.x === move.from.x
        ).length > 1

        const needs_rank = allowed_pieces.length > 1
            && multiple_pieces_on_same_file
        const needs_file = allowed_pieces.length > 1
            && (multiple_pieces_on_same_rank || ! needs_rank)
            || move.piece_type === Piece.Pawn && capture
        return (
            (
                move.piece_type === Piece.Pawn
                ? ""
                : get_letter_by_piece_type(move.piece_type)
            )
            + (needs_file ? file_to_character(move.from.x) : "")
            + (needs_rank ? move.from.y.toString() : "")
        )
    }

    const to_square = coordinates_to_notation(move.to)
    const board_after_move = apply_move(state, move)
    const check_symbol = is_checkmate(board_after_move)
        ? "#"
        : is_check(board_after_move, other_color(state.turn))
        ? "+"
        : ""

    const promotion = move.promotion_piece === undefined
        ? ""
        : "=" + get_letter_by_piece_type(move.promotion_piece)

    const capture_notation = move.is_capture ? "x" : ""
    const from_notation = get_origin_square_notation(
        move.is_capture
    )

    return (
        move.is_castling_kingside
        ? "O-O"
        : move.is_castling_queenside
        ? "O-O-O"
        : from_notation + capture_notation + to_square + promotion
    ) + check_symbol
}
