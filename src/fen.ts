import { BoardPiece, BoardState, Color, get_piece_by_square } from "./board.ts";
import {
    coordinates_from_notation, coordinates_to_notation, make_coordinates
} from "./coordinates.ts";
import {
    get_color_by_letter, get_letter_by_piece, get_piece_by_letter
} from "./notation.ts";

/**
 * Convert a FEN string to a BoardState
 * @param FEN - the FEN string
 * @precondition FEN is of valid FEN format
 * @returns a BoardState representing the FEN string
 */
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
        en_passant_square: parts[3] === "-"
                           ? null
                           : coordinates_from_notation(parts[3]),
        turn: parts[1] === "w" ? Color.White : Color.Black
    }
}

/**
 * Convert a BoardState to a FEN string
 * @param state - the BoardState to convert
 * @returns a FEN string representing the BoardState
 */
export function export_to_fen(state: BoardState): string {
    function row_to_fen(y: number): string {
        return [1, 2, 3, 4, 5, 6, 7, 8].map(
            (x) => get_letter_by_piece(
                get_piece_by_square(make_coordinates(x, y), state)
            )
        ).map(
            (c) => c === "." ? "1" : c
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
