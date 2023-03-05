// The purpose of this file is to be called from the backend.
// It does not expose any functions or type defintions from the backend,
// ensuring that the backend can be changed bravely. However, this file does
// export a function (and a custom return type) that make it possible for the
// backend and frontend to interact.

import { export_to_fen, position_from_fen } from "./fen.ts";
import { get_legal_moves } from "./moves.ts";
import { apply_move } from "./moves.ts";
import { coordinates_eq, coordinates_from_notation } from "./coordinates.ts";
import { get_piece_by_letter } from "./notation.ts";
import { is_checkmate, is_stalemate } from "./mate.ts";
export { DEFAULT_BOARD_FEN } from "./game.ts"

type FrontendState = {
    fen: string,
    from: string,
    to: string,
    checkmate: boolean,
    stalemate: boolean,
    promotion_piece: string,
}

/**
 * Get the resulting FEN string after applying a move to a position
 * @param fen - the FEN string of the position to apply the move to
 * @param from - square notation of where the move originates from
 * @param to - square notation of the move's destination
 * @returns the resulting FEN string or fen itself if there
 * is no valid move as described by from and to
 */
export function next_fen_by_move(state: FrontendState): FrontendState {
    if (state.from === '' || state.to === '') {
        return state
    }
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

    const new_state = apply_move(current_state, move)
    return {
        fen: export_to_fen(new_state),
        from: '', to: '',
        checkmate: is_checkmate(new_state),
        stalemate: is_stalemate(new_state),
        promotion_piece: ''
    }
}
