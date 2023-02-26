import { test, expect } from '@jest/globals'
import { Result, export_to_fen, position_from_fen, apply_move_by_notation, game_result, get_move_by_notation, is_checkmate, is_game_over, is_stalemate, get_default_board } from "everything";

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
