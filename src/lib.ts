// The purpose of this file is to be called from the frontend.
// It does not expose any functions or type defintions from the backend,
// ensuring that the backend can be changed bravely. However, this file does
// export a function (and a custom return type) that make it possible for the
// backend and frontend to interact.

import { export_to_fen, position_from_fen } from "./fen.ts";
import { get_legal_moves } from "./moves.ts";
import { coordinates_eq, coordinates_from_notation } from "./coordinates.ts";
import { is_checkmate, is_stalemate } from "./mate.ts";
import { force_move, Game, play_move, Result } from "./game.ts";
import { get_piece_by_letter, move_to_algebraic_notation } from "./notation.ts";
import { get_engine_move } from "./engine.ts";
export { DEFAULT_BOARD_FEN } from "./game.ts";

type FrontendState = {
    fen: string,
    starting_fen: string,
    from: string,
    to: string,
    checkmate: boolean,
    stalemate: boolean,
    promotion_piece: string,
    played_moves: string[],
    occured_positions: Map<string, number>,
}

/**
 * Convert a FrontendState to a Game
 * @param state - the FrontendState to convert
 * @returns the resulting Game
 */
function frontend_state_to_game(state: FrontendState): Game {
    return {
        state: position_from_fen(state.fen),
        starting_position: state.starting_fen,
        played_moves: state.played_moves,
        occured_positions: state.occured_positions,
        result: Result["*"], // TODO(alex): Should be set an appropriate value?
    }
}

/**
 * Convert a Game to a FrontendState
 * @param game - the Game to convert
 * @returns the resulting FrontendState
 */
function game_to_frontend_state(game: Game): FrontendState {
    return {
        starting_fen: game.starting_position,
        fen: export_to_fen(game.state),
        checkmate: is_checkmate(game.state),
        stalemate: is_stalemate(game.state),
        occured_positions: game.occured_positions,
        played_moves: game.played_moves,

        // Move data
        from: '', to: '',
        promotion_piece: '',
    }

}

/**
 * Get the resulting FrontendState after applying a move to a position
 * @param state - the FrontendState of the position to apply the move to
 * @returns the resulting FrontendState or state itself if there
 * is no valid move as described by the move data of state
 */
export function next_fen_by_move(state: FrontendState): FrontendState {
    if (state.from === '' || state.to === '') {
        return state
    }

    // Reconstruct the game.
    const game: Game = frontend_state_to_game(state)

    const piece_id = state.promotion_piece === ''
                   ? undefined
                   : get_piece_by_letter(state.promotion_piece)
    const coord_from = coordinates_from_notation(state.from)
    const coord_to = coordinates_from_notation(state.to)
    const current_state = position_from_fen(state.fen)
    const moves = get_legal_moves(current_state)
    console.log('found legal moves:', moves)
    const move = moves.find((m) => coordinates_eq(m.from, coord_from) &&
                                   coordinates_eq(m.to, coord_to) &&
                                   (piece_id === undefined ||
                                    piece_id === m.promotion_piece))
    if (move === undefined) {
        console.log('that move could not be found!')
        return state
    }
    if (move.promotion_piece !== undefined && state.promotion_piece === '') {
        return {
            ...state,
            promotion_piece: 'needed'
        }
    }

    const notated_move = move_to_algebraic_notation(current_state, move)

    const game_next = force_move(game, move, notated_move)

    return game_to_frontend_state(game_next)
}

/**
 * Get the resulting FrontendState after playing an AI move in a position
 * @param state - the FrontendState of the position to play the AI move in
 * @returns the resulting FrontendState
 */
export function next_fen_by_ai(state: FrontendState): FrontendState {
    const game = frontend_state_to_game(state)
    const move = get_engine_move(game)
    const game_next = play_move(game, move)

    return game_to_frontend_state(game_next)
}
