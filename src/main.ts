import { draw } from "./draw.ts";
import { apply_move_by_notation, game_result, is_game_over, get_default_board, Result } from "./game.ts";
import { get_legal_moves } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";

let board = get_default_board()
while (! is_game_over(board)) {
    draw(board)
    const input = prompt("move?") ?? ""
    try {
        board = apply_move_by_notation(board, input)
    } catch {
        console.log(`Invalid move ${input}, available moves:`)
        console.log(get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move)).join(", "))
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
