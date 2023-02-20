import { get_default_board } from "./chess.ts";
import { draw } from "./draw.ts";
import { Color } from "./game_types.ts";
import { apply_move, get_legal_moves, is_checkmate } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";

let board = get_default_board()
while (! is_checkmate(board, board.turn)) {
    draw(board)
    const input = prompt("move?")
    const moves = get_legal_moves(board)

    const selected_move = moves.find((m) => move_to_algebraic_notation(board, m) === input)

    if (selected_move !== undefined) {
        board = apply_move(board, selected_move)
    } else {
        console.log(`Invalid move ${input}, available moves:`)
        console.log(moves.map((move) => move_to_algebraic_notation(board, move)).join(", "))
    }
}
console.log(`Game over, ${board.turn === Color.White ? "White" : "Black"} wins`)
