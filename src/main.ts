import { draw } from "./draw.ts";
import { Result, new_game, is_game_in_progress, play_move, display_moves } from "./game.ts";

let game = new_game()
while (is_game_in_progress(game)) {
    draw(game.state)
    const input = prompt("move?") ?? ""
    try {
        game = play_move(game, input)
    } catch {
        console.log(`Invalid move ${input}, available moves:`)
        console.log(display_moves(game))
    }
}
console.log(
    game.result === Result["1-0"]
    ? "Game over, White wins"
    : game.result === Result["0-1"]
    ? "Game over, Black wins"
    : "Game over, the game is drawn"
)
