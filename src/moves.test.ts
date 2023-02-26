import { test, expect } from '@jest/globals'

import {
    Color, Move,
    get_legal_moves, is_check, is_self_check,
    position_from_fen,
    get_piece_by_square, other_color,
    apply_move_by_notation, get_default_board,
    make_coordinates,
} from "everything";


test("starting_position_number_of_moves", () => {
    const board = get_default_board()
    expect(get_legal_moves(board).length).toBe(20)
})

test("rook_and_kings_number_of_moves", () => {
    const board = position_from_fen("8/2k5/8/8/2K5/6R1/8/8 w - - 0 1")
    expect(get_legal_moves(board).length).toBe(22)
})

test("najdorf_number_of_moves", () => {
    const board = position_from_fen("rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6")
    expect(get_legal_moves(board).length).toBe(43)
})

test("apply_move_set_en_passant_square", () => {
    let board = get_default_board()
    for (const move of ["e4", "e6", "e5", "d5"]) {
        board = apply_move_by_notation(board, move)
    }
    expect(board.en_passant_square).toBeDefined()
    expect(board.en_passant_square!.x).toBe(4)
    expect(board.en_passant_square!.y).toBe(6)
})

test("en_passant_capture_pawn", () => {
    let board = get_default_board()
    for (const move of ["e4", "e6", "e5", "d5", "exd6"]) {
        board = apply_move_by_notation(board, move)
    }
    expect(get_piece_by_square(make_coordinates(4, 5), board)).toBeNull()
})

test("en_passant_diagonal_pin", () => {
    let board = position_from_fen("5k2/2p2b2/8/3P4/2K5/8/8/8 b - - 0 1")
    board = apply_move_by_notation(board, "c5")
    expect(board.en_passant_square).toBeNull()
})

test("is_check_bogo_indian", () => {
    const board = position_from_fen("rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 3 4")
    expect(is_check(board, Color.White)).toBe(true)
    const board2 = structuredClone(board)
    board2.turn = other_color(board2.turn)
    expect(is_check(board2, Color.White)).toBe(true)
})

test("is_check_scholars", () => {
    const board = position_from_fen("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
    expect(is_check(board, Color.Black)).toBe(true)
    const board2 = structuredClone(board)
    board2.turn = other_color(board2.turn)
    expect(is_check(board2, Color.Black)).toBe(true)
})

test("is_self_check_h5_scholars", () => {
    const board = position_from_fen("r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
    const move: Move = {
        from: { x: 8, y: 7 },
        to: { x: 8, y: 5 },
        piece_type: 0,
        is_capture: false,
        is_castling: false,
        is_en_passant: false
    } // h5
    expect(is_self_check(board, move)).toBe(true)
})
