import { apply_move, get_legal_moves, is_check, Move } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";
import { position_from_fen } from "./fen.ts";
import { BoardState, Color } from "./board.ts";

export enum Result {
    "1-0",  // White wins
    "1/2-1/2",  // Draw
    "0-1",  // Black wins
    "*"  // Game in progress
}
export const DEFAULT_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

export type Game = {
    state: BoardState,
    starting_position: string,
    played_moves: string[],
    result: Result
}

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

export function display_moves(game: Game): string {
    return get_legal_moves(game.state).map(
        (move) => move_to_algebraic_notation(game.state, move)
    ).join(", ")
}

export function play_move(game: Game, move_notation: string): Game {
    if (game.result !== Result["*"]) {
        throw new Error("Game is finished, no more moves can be played")
    }
    const new_state = apply_move_by_notation(game.state, move_notation)
    return {
        state: new_state,
        starting_position: game.starting_position,
        played_moves: game.played_moves.concat(move_notation),
        result: is_game_over(new_state) ? game_result(new_state) : Result["*"]
    }
}

export function new_game(): Game {
    return {
        state: get_default_board(),
        starting_position: DEFAULT_BOARD_FEN,
        played_moves: [],
        result: Result["*"]
    }
}

export function is_game_in_progress(game: Game): boolean {
    return game.result === Result["*"]
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
