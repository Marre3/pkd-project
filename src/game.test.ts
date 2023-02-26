import { test, expect } from '@jest/globals'
import { Result, export_to_fen, position_from_fen, apply_move_by_notation, game_result, get_move_by_notation, is_checkmate, is_game_over, is_stalemate, get_default_board, new_game, is_game_in_progress, display_moves, play_move } from "everything";

test("checkmate_scholars", () => {
    const board = position_from_fen("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
    expect(is_checkmate(board)).toBe(true)
    expect(is_game_over(board)).toBe(true)
})

test("stalemate_queen", () => {
    const board = position_from_fen("k7/2Q5/1K6/8/8/8/8/8 b - - 0 1")
    expect(is_stalemate(board)).toBe(true)
    expect(is_game_over(board)).toBe(true)
})

test("en_passant_possible_fen", () => {
    const board = position_from_fen("rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3")
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
    expect(export_to_fen(board)).toBe("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
})

test("illegal_move_notation", () => {
    const board = get_default_board()
    const move = "Ne4"
    expect(() => apply_move_by_notation(board, move)).toThrow()
})

test("new_game", () => {
    const expected_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
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
    const board = position_from_fen("rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3")
    expect(game_result(board)).toBe(Result["0-1"])
})

test("game_result_scholar's_mate", () => {
    const board = position_from_fen("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
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
    expect(export_to_fen(game.state)).toBe("rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1")
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
