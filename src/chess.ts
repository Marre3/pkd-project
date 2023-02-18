import { get_piece_by_square, is_piece, other_color, square_has_piece } from "./board.ts";
import { coordinates_from_notation, coordinates_to_notation, file_to_character, make_coordinates } from "./coordinates.ts";
import { BoardPiece, BoardState, Color, Coordinates, Move, Moves, Piece } from "./game_types.ts"
import { apply_move, can_piece_move_to, get_legal_moves, is_check } from "./moves.ts";

function get_piece_by_letter(letter: string): Piece {
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

function get_color_by_letter(letter: string): Color {
    return letter.toLowerCase() === letter ? Color.Black : Color.White
}

function get_letter_by_color(letter: string, color: Color): string {
    return color === Color.White ? letter.toUpperCase() : letter.toLowerCase()
}

export function position_from_fen(FEN: string): BoardState {
    function get_pieces(piece_data: string): BoardPiece[] {
        let y = 8
        const pieces: BoardPiece[] = []
        for (const row of piece_data.split("/")) {
            let x = 1
            for (const c of row) {
                if (isNaN(parseInt(c))) {
                    pieces.push(
                        {
                            piece: get_piece_by_letter(c),
                            color: get_color_by_letter(c),
                            square: make_coordinates(x, y)
                        },
                    )
                    ++x
                } else {
                    x = x + parseInt(c)
                }
            }
            --y
        }
        return pieces
    }
    const parts = FEN.split(" ")
    return {
        width: 8,
        height: 8,
        pieces: get_pieces(parts[0]),
        castling: {
            white_kingside: parts[2].includes("K"),
            white_queenside: parts[2].includes("Q"),
            black_kingside: parts[2].includes("k"),
            black_queenside: parts[2].includes("q")
        },
        halfmove_clock: parseInt(parts[4]),
        fullmove_number: parseInt(parts[5]),
        en_passant_square: parts[3] === "-" ? null : coordinates_from_notation(parts[3]),
        turn: parts[1] === "w" ? Color.White : Color.Black
    }
}


export function export_to_fen(state: BoardState): string {
    function row_to_fen(y: number): string {
        return [1, 2, 3, 4, 5, 6, 7, 8].map(
            (x) => get_letter_by_piece(
                get_piece_by_square(make_coordinates(x, y), state)
            )
        ).map(
            (c) => c === "E" ? "1" : c
        ).reduce(
            (l, r) => (
                ["1", "2", "3", "4", "5", "6", "7"].includes(l.slice(-1))
                && r === "1"
            ) ? l.slice(0, -1) + (parseInt(l.slice(-1)) + 1).toString() : l + r
        )
    }
    function get_castling_rights_string(state: BoardState): string {
        return (
            (state.castling.white_kingside ? "K" : "")
            + (state.castling.white_queenside ? "Q" : "")
            + (state.castling.black_kingside ? "k" : "")
            + (state.castling.black_queenside ? "q" : "")
        ) || "-"
    }
    function get_en_passant_string(state: BoardState): string {
        return state.en_passant_square === null
            ? "-"
            : coordinates_to_notation(state.en_passant_square)

    }
    return (
        [8, 7, 6, 5, 4, 3, 2, 1].map(row_to_fen).join("/")
        + " "
        + (state.turn === Color.White ? "w" : "b")
        + " "
        + get_castling_rights_string(state)
        + " "
        + get_en_passant_string(state)
        + " "
        + state.halfmove_clock.toString()
        + " "
        + state.fullmove_number.toString()
    )
}

export function get_default_board(): BoardState  {
    return position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
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

        let notation = get_letter_by_piece(piece).toUpperCase()
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

    if (!capture) {
        const from_notation = construct_notation_for_from_coordinates(false)
        return from_notation + to_square + symbol
    } else {
        const from_notation = construct_notation_for_from_coordinates(true)
        return from_notation + "x" + to_square + symbol
    }
}
