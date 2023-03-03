import {
    BoardPiece, BoardState, Color, get_player_pieces,
    is_piece, other_color, Piece
} from "./board.ts";
import { coordinates_to_notation, file_to_character } from "./coordinates.ts";
import { is_checkmate } from "./game.ts";
import { apply_move, can_piece_move_to, is_check, Move } from "./moves.ts";

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

export function get_letter_by_piece(board_piece: BoardPiece | null): string {
    return is_piece(board_piece)
    ? get_letter_by_color(
        get_letter_by_piece_type(board_piece.piece),
        board_piece.color
    )
    : "."
}

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

export function get_color_by_letter(letter: string): Color {
    return letter.toLowerCase() === letter ? Color.Black : Color.White
}

function get_letter_by_color(letter: string, color: Color): string {
    return color === Color.White ? letter.toUpperCase() : letter.toLowerCase()
}

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
