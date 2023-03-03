import { Game, new_game, play_move } from "./game.ts";

/**
 * Export a game to PGN format
 * @param game - the game to export
 * @returns a string in PGN format representing the game
 */
export function export_to_pgn(game: Game): string {
    const pgn_list = []
    for (let i = 0; i < game.played_moves.length; ++i ) {
        if (i % 2 === 0) {
            pgn_list.push(`${i / 2 + 1}.`)
        }
        pgn_list.push(game.played_moves[i])
    }
    return pgn_list.join(" ")
}

/**
 * Import a game from PGN
 * @param pgn - PGN of the game
 * @precondition pgn is of valid PGN format but
 * contains no tag pairs or comments
 * @returns a game based on the PGN
 */
export function import_from_pgn(pgn: string): Game {
    return pgn.split(
        " "
    ).filter(
        (str) => isNaN(parseInt(str.slice(0, 1)))
    ).reduce(
        play_move,
        new_game()
    )
}
