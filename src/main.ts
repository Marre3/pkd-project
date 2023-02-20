import { get_default_board } from "./chess.ts";
import { draw } from "./draw.ts";
import { get_legal_moves } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";

const board = get_default_board()

draw(board)

for (const move of get_legal_moves(board)) {
    console.log(move_to_algebraic_notation(board, move))
}
