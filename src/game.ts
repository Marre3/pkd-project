import { BoardState } from "./game_types.ts";
import { is_checkmate, is_stalemate } from "./moves.ts";

export function is_game_over(state: BoardState): boolean {
    return is_checkmate(state) || is_stalemate(state)
}
