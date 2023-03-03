import { Game } from "./game.ts";

export function export_to_pgn(game: Game): string {
    let pgn_list = []
    for (let i = 0; i < game.played_moves.length; ++i ) {
        if (i % 2 === 0) {
            pgn_list.push(`${i / 2 + 1}.`)
        }
        pgn_list.push(game.played_moves[i])
    }

    return pgn_list.join(" ")
}
