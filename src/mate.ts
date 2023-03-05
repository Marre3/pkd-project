import { BoardState } from "./board.ts";
import { get_legal_moves, is_check } from "./moves.ts";

/**
 * Check if a checkmate has occured on a given BoardState
 * @param state - the given BoardState
 * @returns true if a checkmate has occured, false otherwise
 */
export function is_checkmate(state: BoardState): boolean {
    return is_check(state, state.turn) && get_legal_moves(state).length === 0
}

/**
 * Check if a stalemate has occured on a given BoardState
 * @param state - the given BoardState
 * @returns true if a stalemate has occured, false otherwise
 */
export function is_stalemate(state: BoardState): boolean {
    return ! is_check(state, state.turn) && get_legal_moves(state).length === 0
}
