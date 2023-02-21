// The purpose of this file is to be called from the backend.
// It does not expose any functions or type defintions from the backend,
// ensuring that the backend can be changed bravely. However, this file does
// export a function that make it possible for the backend and frontend
// to interact.

import { export_to_fen, position_from_fen } from "./fen.ts";
import { get_legal_moves } from "./moves.ts";
import { apply_move } from "./moves.ts";
import { coordinates_eq, coordinates_from_notation } from "./coordinates.ts";

export function next_fen_by_move(fen: string, from: string, to: string) {
    const coord_from = coordinates_from_notation(from)
    const coord_to = coordinates_from_notation(to)
    const state = position_from_fen(fen)
    const moves = get_legal_moves(state)
    console.log('found legal moves:', moves)
    const move = moves.find((m) => coordinates_eq(m.from, coord_from) &&
                                   coordinates_eq(m.to, coord_to))
    if (move === undefined) {
        console.log('that move could not be found!')
        return fen
    }
    const new_state = apply_move(state, move)
    return export_to_fen(new_state)
}
