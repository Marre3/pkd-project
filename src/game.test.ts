import { test, expect } from '@jest/globals'
import {
    Result, export_to_fen, position_from_fen,
    apply_move_by_notation, game_result, get_move_by_notation,
    is_checkmate, is_game_over, is_stalemate, get_default_board,
    new_game, is_game_in_progress, display_moves, play_move
} from "everything";
import { import_from_pgn } from './pgn.ts';

test("checkmate_scholars", () => {
    const board = position_from_fen(
        "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
        )
    expect(is_checkmate(board)).toBe(true)
    expect(is_game_over(board)).toBe(true)
})

test("stalemate_queen", () => {
    const board = position_from_fen("k7/2Q5/1K6/8/8/8/8/8 b - - 0 1")
    expect(is_stalemate(board)).toBe(true)
    expect(is_game_over(board)).toBe(true)
})

test("en_passant_possible_fen", () => {
    const board = position_from_fen(
        "rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3"
    )
    expect(get_move_by_notation(board, "exd6")).toBeDefined()
})

test("en_passant_possible_moves", () => {
    let board = get_default_board()
    for (const move of ["e4", "e6", "e5", "d5"]) {
        board = apply_move_by_notation(board, move)
    }
    expect(get_move_by_notation(board, "exd6")).toBeDefined()
})

test("scholars_mate", () => {
    let board = get_default_board()
    for (const move of ["e4", "e5", "Qh5", "Nc6", "Bc4", "Nf6", "Qxf7#"]) {
        board = apply_move_by_notation(board, move)
    }
    expect(is_game_over(board)).toBe(true)
    expect(is_checkmate(board)).toBe(true)
    expect(! is_stalemate(board)).toBe(true)
    expect(game_result(board) === Result["1-0"]).toBe(true)
    expect(
        export_to_fen(board)
    ).toBe("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
})

test("illegal_move_notation", () => {
    const board = get_default_board()
    const move = "Ne4"
    expect(() => apply_move_by_notation(board, move)).toThrow()
})

test("new_game", () => {
    const expected_fen = (
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    )
    const game = new_game()
    expect(game.starting_position).toBe(expected_fen)
    expect(export_to_fen(game.state)).toBe(expected_fen)
    expect(game.played_moves.length).toBe(0)
    expect(game.result).toBe(Result["*"])
})

test("is_game_in_progress_new_game", () => {
    const game = new_game()
    expect(is_game_in_progress(game)).toBe(true)
})

test("game_result_in_progress_game", () => {
    const board = get_default_board()
    expect(() => game_result(board)).toThrow()
})

test("game_result_fool's_mate", () => {
    const board = position_from_fen(
        "rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3"
        )
    expect(game_result(board)).toBe(Result["0-1"])
})

test("game_result_scholar's_mate", () => {
    const board = position_from_fen(
        "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
    )
    expect(game_result(board)).toBe(Result["1-0"])
})

test("game_result_stalemate", () => {
    const board = position_from_fen("k7/2K5/1Q6/8/8/8/8/8 b - - 0 1")
    expect(game_result(board)).toBe(Result["1/2-1/2"])
})

test("display_moves", () => {
    const game = new_game()
    expect(display_moves(game).split(", ").sort()).toEqual([
        "Na3", "Nc3", "Nf3", "Nh3", "a3", "a4", "b3", "b4", "c3", "c4",
        "d3", "d4", "e3", "e4", "f3", "f4", "g3", "g4", "h3", "h4"
    ])
})

test("play_move", () => {
    let game = new_game()
    game = play_move(game, "Nf3")
    expect(is_game_in_progress(game)).toBe(true)
    expect(
        export_to_fen(game.state)
    ).toBe("rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1")
})

test("play_move_checkmate", () => {
    let game = new_game()
    game = play_move(game, "e4")
    game = play_move(game, "e5")
    game = play_move(game, "Qh5")
    game = play_move(game, "Nc6")
    game = play_move(game, "Bc4")
    game = play_move(game, "Nf6")
    game = play_move(game, "Qxf7#")
    expect(is_game_in_progress(game)).toBe(false)
    expect(game.result).toBe(Result["1-0"])
})

test("play_move_game_already_over", () => {
    let game = new_game()
    game = play_move(game, "e4")
    game = play_move(game, "e5")
    game = play_move(game, "Qh5")
    game = play_move(game, "Nc6")
    game = play_move(game, "Bc4")
    game = play_move(game, "Nf6")
    game = play_move(game, "Qxf7#")
    expect(() => play_move(game, "d5")).toThrow()
})

test("threefold_repetition_bongcloud", () => {
    let game = new_game()
    game = play_move(game, "e4")
    game = play_move(game, "e5")
    game = play_move(game, "Ke2")
    game = play_move(game, "Ke7")
    game = play_move(game, "Ke1")
    game = play_move(game, "Ke8")
    game = play_move(game, "Ke2")
    game = play_move(game, "Ke7")
    game = play_move(game, "Ke1")
    game = play_move(game, "Ke8")
    game = play_move(game, "Ke2")
    game = play_move(game, "Ke7")
    expect(game.result).toBe(Result["1/2-1/2"])
})

// Anatoly Karpov vs Garry Kasparov (Tilburg NL, 1991)
// https://www.chessgames.com/perl/chessgame?gid=1067317
test("threefold_repetition_full_game", () => {
    const game = import_from_pgn(
        "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6"
        + " 8. d5 Ne7 9. Nd2 a5 10. Rb1 Nd7 11. a3 f5 12. b4 Kh8 13. f3 Ng8 14."
        + " Qc2 Ngf6 15. Nb5 axb4 16. axb4 Nh5 17. g3 Ndf6 18. c5 Bd7 19. Rb3"
        + " Nxg3 20. hxg3 Nh5 21. f4 exf4 22. c6 bxc6 23. dxc6 Nxg3 24. Rxg3"
        + " fxg3 25. cxd7 g2 26. Rf3 Qxd7 27. Bb2 fxe4 28. Rxf8+ Rxf8 29. Bxg7+"
        + " Qxg7 30. Qxe4 Qf6 31. Nf3 Qf4 32. Qe7 Rf7 33. Qe6 Rf6 34. Qe8+ Rf8"
        + " 35. Qe7 Rf7 36. Qe6 Rf6 37. Qb3 g5 38. Nxc7 g4 39. Nd5 Qc1+ 40. Qd1"
        + " Qxd1+ 41. Bxd1 Rf5 42. Ne3 Rf4 43. Ne1 Rxb4 44. Bxg4 h5 45. Bf3 d5"
        + " 46. N3xg2 h4 47. Nd3 Ra4 48. Ngf4 Kg7 49. Kg2 Kf6 50. Bxd5 Ra5 51."
        + " Bc6 Ra6 52. Bb7 Ra3 53. Be4 Ra4 54. Bd5 Ra5 55. Bc6 Ra6 56. Bf3 Kg5"
        + " 57. Bb7 Ra1 58. Bc8 Ra4 59. Kf3 Rc4 60. Bd7 Kf6 61. Kg4 Rd4 62. Bc6"
        + " Rd8 63. Kxh4 Rg8 64. Be4 Rg1 65. Nh5+ Ke6 66. Ng3 Kf6 67. Kg4 Ra1"
        + " 68. Bd5 Ra5 69. Bf3 Ra1 70. Kf4 Ke6 71. Nc5+ Kd6 72. Nge4+ Ke7 73."
        + " Ke5 Rf1 74. Bg4 Rg1 75. Be6 Re1 76. Bc8 Rc1 77. Kd4 Rd1+ 78. Nd3"
        + " Kf7 79. Ke3 Ra1 80. Kf4 Ke7 81. Nb4 Rc1 82. Nd5+ Kf7 83. Bd7 Rf1+"
        + " 84. Ke5 Ra1 85. Ng5+ Kg6 86. Nf3 Kg7 87. Bg4 Kg6 88. Nf4+ Kg7 89."
        + " Nd4 Re1+ 90. Kf5 Rc1 91. Be2 Re1 92. Bh5 Ra1 93. Nfe6+ Kh6 94. Be8"
        + " Ra8 95. Bc6 Ra1 96. Kf6 Kh7 97. Ng5+ Kh8 98. Nde6 Ra6 99. Be8 Ra8"
        + " 100. Bh5 Ra1 101. Bg6 Rf1+ 102. Ke7 Ra1 103. Nf7+ Kg8 104. Nh6+ Kh8"
        + " 105. Nf5 Ra7+ 106. Kf6 Ra1 107. Ne3 Re1 108. Nd5 Rg1 109. Bf5 Rf1"
        + " 110. Ndf4 Ra1 111. Ng6+ Kg8 112. Ne7+ Kh8 113. Ng5"
    )
    expect(game.result).toBe(Result["1/2-1/2"])
})
