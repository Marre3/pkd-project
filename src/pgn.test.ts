import { test, expect } from '@jest/globals'
import { new_game, play_move } from "everything";
import { export_to_pgn } from './pgn.ts';

test("export_najdorf", () => {
    let game = new_game()
    game = play_move(game, "e4")
    game = play_move(game, "c5")
    game = play_move(game, "Nf3")
    game = play_move(game, "d6")
    game = play_move(game, "d4")
    game = play_move(game, "cxd4")
    game = play_move(game, "Nxd4")
    game = play_move(game, "Nf6")
    game = play_move(game, "Nc3")
    game = play_move(game, "a6")
    expect(export_to_pgn(game)).toBe("1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6")
})
