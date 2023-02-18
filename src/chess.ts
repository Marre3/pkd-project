import { position_from_fen } from "./fen.ts";
import { BoardState } from "./game_types.ts";

export function get_default_board(): BoardState  {
    return position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
}
