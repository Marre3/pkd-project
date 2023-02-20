import { BoardState, Color, Result } from "./game_types.ts";
import { get_legal_moves, is_check } from "./moves.ts";

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
    return is_checkmate(state)
        ? (state.turn === Color.Black ? Result["1-0"] : Result["0-1"])
        : Result["1/2-1/2"]
}
