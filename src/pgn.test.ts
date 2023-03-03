import { test, expect } from '@jest/globals'
import { export_to_fen, new_game, play_move } from "everything";
import { export_to_pgn, import_from_pgn } from './pgn.ts';

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
    expect(export_to_pgn(game)).toBe(
        "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6"
    )
})

// https://www.chess.com/game/live/70137822225
test("import_full_game", () => {
    const pgn = (
        "1. Nf3 d5 2. g3 c5 3. Bg2 Nf6 4. O-O Nc6 5. d4 Bf5 6. a3 e6 7. c4 cxd4"
        + " 8. Nxd4 Nxd4 9. Qxd4 Be7 10. cxd5 Bxb1 11. Rxb1 O-O 12. Be3 Nxd5"
        + " 13. Bxd5 Qxd5 14. Qxd5 exd5 15. Rfd1 Rfd8 16. Rbc1 Bf6 17. Rc5 d4"
        + " 18. Bf4 Rac8 19. Rxc8 Rxc8 20. Rc1 Rxc1+ 21. Bxc1 Kf8 22. Kf1 Ke7"
        + " 23. Ke1 Kd6 24. Kd2 Kd5 25. Kd3 h5"
    )
    const game = import_from_pgn(pgn)
    expect(export_to_pgn(game)).toBe(pgn)
    expect(export_to_fen(game.state)).toBe(
        "8/pp3pp1/5b2/3k3p/3p4/P2K2P1/1P2PP1P/2B5 w - - 0 26"
    )
})
