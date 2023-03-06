import { Color } from "./board.ts";
import { draw } from "./draw.ts";
import {
    Result, new_game, is_game_in_progress, play_move, display_moves
} from "./game.ts";
import { export_to_pgn } from "./pgn.ts";
import { get_engine_move } from "./engine.ts"
import { export_to_fen } from "./fen.ts";

let gamemode = ""
while (gamemode !== "ai" && gamemode !== "pvp") {
    gamemode = prompt(
        "Do you want to play against the computer or another player? (ai | pvp)"
    ) ?? ""
}

let engine_color = Color.White
if (gamemode === "ai") {
    let input = ""
    while (input !== "white" && input !== "black") {
        input = prompt("What color will you play as? (white | black)") ?? ""
    }
    engine_color = input === "white"
                   ? Color.Black
                   : Color.White
}

let game = new_game()
while (is_game_in_progress(game)) {
    if (gamemode === "ai" && game.state.turn === engine_color) {
        console.log("The engine is thinking...")
        const engine_move = get_engine_move(game)
        console.log("The engine plays " + engine_move)
        game = play_move(game, engine_move)
    } else {
        draw(game.state)
        console.log(
            (game.state.turn === Color.White ? "White" : "Black") + " to play"
        )
        const input = prompt(
            "Enter your move (or another command, see \"info\"):"
        ) ?? ""

        if (input === "info") {
            console.log(
                "PKD-Chess by group 32: Alexander Björkman, Elias Swanberg, "
                + "and Mauritz Hamrin Sverredal.\n"
                + "Available commands:\n"
                + "info: Display this message\n"
                + "moves: Display all legal moves\n"
                + "resign: Resign the game\n"
                + "pvp: Change the gamemode to player vs player\n"
                + "ai: Change the gamemode to player vs computer\n"
                + "exit: Exit the program\n"
                + "fen: get the current position in Forsyth-Edwards Notation\n"
                + "pgn: get the current game in Portable Game Notation\n"
                + "To play a move, enter the move in Algebraic Notation.\n"
            )
            prompt("Press enter to continue")
        } else if (input === "resign") {
            game.result = game.state.turn === Color.White
                          ? Result["0-1"]
                          : Result["1-0"]
        } else if (input === "pvp") {
            gamemode = "pvp"
        } else if (input === "ai") {
            gamemode = "ai"
            let input = ""
            while (input !== "white" && input !== "black") {
                input = prompt(
                    "What color will you play as? (white | black)"
                ) ?? ""
            }
            engine_color = input === "white"
                        ? Color.Black
                        : Color.White
        } else if (input === "fen") {
            console.log("Position FEN: " + export_to_fen(game.state))
        } else if (input === "pgn") {
            console.log("Game PGN: " + export_to_pgn(game))
        } else if (input === "exit") {
            Deno.exit(0)
        } else {
            try {
                game = play_move(game, input)
            } catch {
                console.log(`Invalid move/command ${input}, available moves:`)
                console.log(display_moves(game))
                console.log("or \"info\" to view available commands")
                prompt("Press enter to continue")
            }
        }
        console.log()  // Spacer
    }

}
console.log(
    game.result === Result["1-0"]
    ? "Game over, White wins"
    : game.result === Result["0-1"]
    ? "Game over, Black wins"
    : "Game over, the game is drawn"
)
console.log("Game PGN: " + export_to_pgn(game))
