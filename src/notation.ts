import { get_piece_by_square, is_piece, other_color, square_has_piece } from "./board.ts";
import { coordinates_to_notation, file_to_character } from "./coordinates.ts";
import { BoardPiece, BoardState, Color, Move, Piece } from "./game_types.ts";
import { apply_move, can_piece_move_to, get_legal_moves, is_check } from "./moves.ts";

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

export function get_letter_by_piece(boardPiece: BoardPiece | null): string {
    if (!is_piece(boardPiece)) return "E"

    const piece = boardPiece.piece
    return get_letter_by_color(
        piece === Piece.Pawn
        ? "P"
        : piece === Piece.Knight
        ? "N"
        : piece === Piece.Bishop
        ? "B"
        : piece === Piece.Rook
        ? "R"
        : piece === Piece.Queen
        ? "Q"
        : "K",
        boardPiece.color
    )
}

function get_letter_by_piece_type(piece: Piece): string {
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

export function move_to_algebraic_notation(state: BoardState, move: Move): string {
    function get_pieces_of_type(type: Piece, file?: number, rank?: number): BoardPiece[] {
        let pieces: BoardPiece[] = []
        for (const piece of state.pieces) {
            if (piece.color === state.turn && piece.piece === type) {
                if (typeof file !== "undefined" && piece.square.x !== file) continue
                if (typeof rank !== "undefined" && piece.square.y !== rank) continue
                pieces = pieces.concat(piece)
            }
        }
        return pieces
    }

    function construct_notation_for_from_coordinates(capture: boolean): string {
        if (move.piece_type === Piece.Pawn) {
            return capture ? file_to_character(move.from.x) : ""
        } else if (move.piece_type === Piece.King) {
            return "K"
        }

        let notation = get_letter_by_piece_type((piece as BoardPiece).piece)
        const allowed_pieces_on_same_rank: BoardPiece[] = get_pieces_of_type(move.piece_type, undefined, move.from.y).filter(
            (p: BoardPiece) => can_piece_move_to(state, p, move.to))

        if (allowed_pieces_on_same_rank.length > 1) {
            notation += file_to_character(move.from.x)
        }

        const allowed_pieces_on_same_file: BoardPiece[] = get_pieces_of_type(move.piece_type, move.from.x).filter(
            (p: BoardPiece) => can_piece_move_to(state, p, move.to))

        if (allowed_pieces_on_same_file.length > 1) {
            notation += move.from.y.toString()
        }

        return notation
    }

    const piece = get_piece_by_square(move.from, state)

    if (!is_piece(piece)) {
        throw new Error(`No piece found at: ${coordinates_to_notation(move.from)}`)
    }

    if (state.turn !== piece.color) {
        throw new Error(`The piece at: ${coordinates_to_notation(move.from)} is of the wrong color`)
    }

    if (piece.piece !== move.piece_type) {
        throw new Error(`The piece at: ${coordinates_to_notation(move.from)} is of the wrong piece type`)
    }

    // TODO: handle castling

    if (!can_piece_move_to(state, piece, move.to)) {
        throw new Error(`The piece at: ${coordinates_to_notation(move.from)} cannot move to ${coordinates_to_notation(move.to)}`)
    }

    const to_square: string = coordinates_to_notation(move.to)
    const capture: boolean = square_has_piece(move.to, state, other_color(state.turn)) || move.is_en_passant
    let symbol = ""
    const board_after_move = apply_move(state, move)

    if (is_check(board_after_move, other_color(state.turn))) {
        if (get_legal_moves(board_after_move).length > 0) {
            symbol = "+"
        } else {
            symbol = "#"
        }
    }

    let promotion = ""
    if (typeof move.promotion_piece !== "undefined") {
        const promotion_piece = move.promotion_piece

        if (promotion_piece === Piece.Pawn || promotion_piece === Piece.King) {
            throw new Error(`The promotion piece: ${promotion_piece} is of an incorrect type`)
        }

        promotion = "=" + get_letter_by_piece_type(move.promotion_piece)
    }

    if (!capture) {
        const from_notation = construct_notation_for_from_coordinates(false)
        return from_notation + to_square + promotion + symbol
    } else {
        const from_notation = construct_notation_for_from_coordinates(true)
        return from_notation + "x" + to_square + promotion + symbol
    }
}
