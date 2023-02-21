import { BoardState, Color, Move, Result } from "./game_types.ts";
import { apply_move, get_legal_moves, is_check } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";
import { position_from_fen } from "./fen.ts";

export const DEFAULT_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

export function get_default_board(): BoardState  {
    return position_from_fen(DEFAULT_BOARD_FEN)
}

export function get_move_by_notation(state: BoardState, move_notation: string): Move | null {
    return get_legal_moves(state).find(
        (move) => move_to_algebraic_notation(state, move) === move_notation
    ) ?? null
}

export function apply_move_by_notation(state: BoardState, move_notation: string): BoardState {
    const move = get_move_by_notation(state, move_notation)
    if (move !== null) {
        return apply_move(state, move)
    } else {
        throw new Error(`Illegal move ${move_notation}`)
    }
}

export function is_checkmate(state: BoardState): boolean {
    return is_check(state, state.turn) && get_legal_moves(state).length === 0
}

export function is_stalemate(state: BoardState): boolean {
    return ! is_check(state, state.turn) && get_legal_moves(state).length === 0
}

export function is_game_over(state: BoardState): boolean {
    return is_checkmate(state) || is_stalemate(state)
}

export function game_result(state: BoardState): Result {
    if (is_game_over(state)) {
        return is_checkmate(state)
            ? (state.turn === Color.Black ? Result["1-0"] : Result["0-1"])
            : Result["1/2-1/2"]
    } else {
        throw new Error("game_result(): Invalid state, game is still in progress")
    }
}
