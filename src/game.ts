import { apply_move, get_legal_moves, is_check, Move } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";
import { export_to_fen, position_from_fen } from "./fen.ts";
import { BoardState, Color } from "./board.ts";

export enum Result {
    "1-0",  // White wins
    "1/2-1/2",  // Draw
    "0-1",  // Black wins
    "*"  // Game in progress
}
export const DEFAULT_BOARD_FEN = (
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
)

export type Game = {
    state: BoardState,
    starting_position: string,
    played_moves: string[],
    occured_positions: Map<string, number>,
    result: Result
}

/**
 * Get a BoardState of the default starting chess position
 * @returns a BoardState of the default starting chess position
 */
export function get_default_board(): BoardState  {
    return position_from_fen(DEFAULT_BOARD_FEN)
}

/**
 * Convert algebraic notation of a move on a BoardState to its Move record
 * @param state - the BoardState where the move is considered
 * @param move_notation - algebraic notation of the move
 * @returns the Move record if it's a legal move, or null otherwise
 */
export function get_move_by_notation(
    state: BoardState,
    move_notation: string
): Move | null {
    return get_legal_moves(state).find(
        (move) => move_to_algebraic_notation(state, move) === move_notation
    ) ?? null
}

/**
 * Get the resulting BoardState after applying a move by notation to a BoardState
 * @param state - the BoardState where the move is applied
 * @param move_notation - algebraic notation of the move
 * @returns the resulting BoardState
 * @throws an error if move_notation does not represent a legal move in the position
 */
export function apply_move_by_notation(
    state: BoardState,
    move_notation: string
): BoardState {
    const move = get_move_by_notation(state, move_notation)
    if (move !== null) {
        return apply_move(state, move)
    } else {
        throw new Error(`Illegal move ${move_notation}`)
    }
}

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

/**
 * Check if a checkmate or a stalemate has occured on a given BoardState
 * @param state - the given BoardState
 * @returns true if a checkmate or a stalemate has occured, false otherwise
 */
export function is_game_over(state: BoardState): boolean {
    return is_checkmate(state) || is_stalemate(state)
}

/**
 * Get the moves played in a given Game as a string of the moves in algebraic notation separated by commas
 * @param game - the given Game
 * @returns a string of the moves in algebraic notation separated by commas
 */
export function display_moves(game: Game): string {
    return get_legal_moves(game.state).map(
        (move) => move_to_algebraic_notation(game.state, move)
    ).join(", ")
}

/** Remove move counters from position string
 * as they do not count for the 50-move rule
 * @param fen - The FEN string for the position
 * @returns - The FEN string minus the halfmove and fullmove counters
 */
function strip_move_counters(fen: string): string {
    return fen.split(" ").slice(0, 4).join(" ")
}

/**
 * This function does not check to make sure that
 * the move being forced is a valid move.
 * @param game - the Game the move should be played in
 * @param move - the move being forced
 * @param notation - the notation of the move
 * @returns the resulting Game
 * @throws an error if the game is already finished
 */
export function force_move(game: Game,
                           move: Move,
                           move_notation: string): Game {
    if (game.result !== Result["*"]) {
        throw new Error("Game is finished, no more moves can be played")
    }
    const new_state = apply_move(game.state, move)

    const occured_positions: Map<string, number> = structuredClone(
        game.occured_positions
    )

    const current_position = strip_move_counters(export_to_fen(new_state))

    // Number of times the current position has been
    // reached, for threefold repetition draws.
    const repetition_count = (occured_positions.get(current_position) ?? 0) + 1
    occured_positions.set(current_position, repetition_count)

    // Check if the game is drawn by threefold repetition or 50-move rule
    const result = repetition_count === 3 || new_state.halfmove_clock === 100
        ? Result["1/2-1/2"]
        : is_game_over(new_state)
        ? game_result(new_state)
        : Result["*"]

    return {
        state: new_state,
        starting_position: game.starting_position,
        played_moves: game.played_moves.concat(move_notation),
        occured_positions: occured_positions,
        result: result
    }
}

/**
 * Get the resulting Game after playing a move in a given Game
 * @param game - the Game the move should be played in
 * @param move_notation - algebraic notation of the move
 * @returns the resulting Game
 * @throws an error if the game is already finished
 */
export function play_move(game: Game, move_notation: string): Game {
    const move = get_move_by_notation(game.state, move_notation)
    if (move === null) {
        throw new Error(`Illegal move ${move_notation}`)
    }

    // Now that the move is known to be valid/safe, we may proceed.
    return force_move(game, move, move_notation)
}

/**
 * Create a new Game with the default starting chess position
 * @returns the new Game
 */
export function new_game(): Game {
    return {
        state: get_default_board(),
        starting_position: DEFAULT_BOARD_FEN,
        played_moves: [],
        occured_positions: new Map([[strip_move_counters(DEFAULT_BOARD_FEN), 1]]),
        result: Result["*"]
    }
}

/**
 * Check if a given Game is still in progress
 * @param game - the given Game
 * @returns true if game is still in progress, false otherwise
 */
export function is_game_in_progress(game: Game): boolean {
    return game.result === Result["*"]
}

/**
 * Get the result of a given BoardState
 * @param state - the given BoardState
 * @returns a Result enumerator representing the result
 * @throws an error if no checkmate or stalemate has occured on state
 */
export function game_result(state: BoardState): Result {
    if (is_game_over(state)) {
        return is_checkmate(state)
            ? (state.turn === Color.Black ? Result["1-0"] : Result["0-1"])
            : Result["1/2-1/2"]
    } else {
        throw new Error(
            "game_result(): Invalid state, game is still in progress"
        )
    }
}
