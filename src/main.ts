import { get_default_board } from "./chess.ts";
import { draw } from "./draw.ts";
import { game_result, is_game_over } from "./game.ts";
import { Result } from "./game_types.ts";
import { apply_move, get_legal_moves } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";

let board = get_default_board()
while (! is_game_over(board)) {
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
switch (game_result(board)) {
    case (Result["1-0"]): {
        console.log("Game over, White wins")
        break;
    }
    case (Result["0-1"]): {
        console.log("Game over, Black wins")
        break;
    }
    case (Result["1/2-1/2"]): {
        console.log("Game over, the game is drawn")
        break;
    }
}
