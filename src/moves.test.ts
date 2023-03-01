import { test, expect } from '@jest/globals'

import {
    Color, Move,
    get_legal_moves, is_check, is_self_check,
    position_from_fen,
    get_piece_by_square, other_color,
    apply_move_by_notation, get_default_board,
    make_coordinates, is_square_attacked_by, Piece, apply_move, get_move_by_notation
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
        is_castling_kingside: false,
        is_castling_queenside: false,
        is_en_passant: false
    } // h5
    expect(is_self_check(board, move)).toBe(true)
})

test("is_square_attacked_by_test", () => {
    const board = position_from_fen("8/8/2k1p3/8/8/5P2/2K5/8 w - - 0 1")
    expect(is_square_attacked_by(board, make_coordinates(4, 3), Color.White)).toBe(true)
    expect(is_square_attacked_by(board, make_coordinates(7, 4), Color.White)).toBe(true)
    expect(!is_square_attacked_by(board, make_coordinates(6, 4), Color.White)).toBe(true)
    expect(is_square_attacked_by(board, make_coordinates(5, 4), Color.White)).toBe(true)
    expect(is_square_attacked_by(board, make_coordinates(6, 5), Color.Black)).toBe(true)
    expect(!is_square_attacked_by(board, make_coordinates(5, 5), Color.Black)).toBe(true)
    expect(is_square_attacked_by(board, make_coordinates(4, 5), Color.Black)).toBe(true)
})

test("is_square_attacked_by_despite_pin_test", () => {
    const board = position_from_fen("8/k7/b7/8/8/8/8/R3K2R w K - 0 1")
    expect(is_square_attacked_by(board, make_coordinates(6, 1), Color.Black)).toBe(true)
})

test("apply_move_invalid_origin_square", () => {
    const board = get_default_board()
    const move: Move = {
        from: { x: 1, y: 4 },
        to: { x: 1, y: 5 },
        piece_type: Piece.Pawn,
        is_capture: false,
        is_castling_kingside: false,
        is_castling_queenside: false,
        is_en_passant: false
    } // h4-h5
    expect(() => apply_move(board, move)).toThrow()
})

test("apply_castling_kingside_white", () => {
    const board = position_from_fen("r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4")
    const move = get_move_by_notation(board, "O-O")
    expect(move).not.toBeNull()
    const result_position = apply_move(board, move!)

    const king_destination = make_coordinates(7, 1)  // g1
    expect(get_piece_by_square(king_destination, result_position)).not.toBeNull()
    expect(get_piece_by_square(king_destination, result_position)?.piece).toBe(Piece.King)

    const rook_destination = make_coordinates(6, 1)  // f1
    expect(get_piece_by_square(rook_destination, result_position)).not.toBeNull()
    expect(get_piece_by_square(rook_destination, result_position)?.piece).toBe(Piece.Rook)

    const king_origin = make_coordinates(5, 1)  // e1
    expect(get_piece_by_square(king_origin, result_position)).toBeNull()

    const rook_origin = make_coordinates(8, 1)  // h1
    expect(get_piece_by_square(rook_origin, result_position)).toBeNull()
})

test("apply_castling_kingside_black", () => {
    const board = position_from_fen("r1bqk2r/pppp1ppp/2n2n2/1Bb1p3/4P3/2P2N2/PP1P1PPP/RNBQ1RK1 b kq - 0 5")
    const move = get_move_by_notation(board, "O-O")
    expect(move).not.toBeNull()
    const result_position = apply_move(board, move!)

    const king_destination = make_coordinates(7, 8)  // g8
    expect(get_piece_by_square(king_destination, result_position)).not.toBeNull()
    expect(get_piece_by_square(king_destination, result_position)?.piece).toBe(Piece.King)

    const rook_destination = make_coordinates(6, 8)  // f8
    expect(get_piece_by_square(rook_destination, result_position)).not.toBeNull()
    expect(get_piece_by_square(rook_destination, result_position)?.piece).toBe(Piece.Rook)

    const king_origin = make_coordinates(5, 8)  // e8
    expect(get_piece_by_square(king_origin, result_position)).toBeNull()

    const rook_origin = make_coordinates(8, 8)  // h8
    expect(get_piece_by_square(rook_origin, result_position)).toBeNull()
})

test("apply_castling_queenside_white", () => {
    const board = position_from_fen("rn1q1rk1/1p2bppp/p2pbn2/4p3/4P3/1NN1BP2/PPPQ2PP/R3KB1R w KQ - 3 10")
    const move = get_move_by_notation(board, "O-O-O")
    expect(move).not.toBeNull()
    const result_position = apply_move(board, move!)

    const king_destination = make_coordinates(3, 1)  // c1
    expect(get_piece_by_square(king_destination, result_position)).not.toBeNull()
    expect(get_piece_by_square(king_destination, result_position)?.piece).toBe(Piece.King)

    const rook_destination = make_coordinates(4, 1)  // d1
    expect(get_piece_by_square(rook_destination, result_position)).not.toBeNull()
    expect(get_piece_by_square(rook_destination, result_position)?.piece).toBe(Piece.Rook)

    const king_origin = make_coordinates(5, 1)  // e1
    expect(get_piece_by_square(king_origin, result_position)).toBeNull()

    const rook_origin = make_coordinates(1, 1)  // a1
    expect(get_piece_by_square(rook_origin, result_position)).toBeNull()
})

test("apply_castling_queenside_black", () => {
    const board = position_from_fen("r3k2r/ppp2ppp/2p5/2b5/4P1bq/3P4/PPP2PPP/RNB1QRK1 b kq - 1 9")
    const move = get_move_by_notation(board, "O-O-O")
    expect(move).not.toBeNull()
    const result_position = apply_move(board, move!)

    const king_destination = make_coordinates(3, 8)  // c8
    expect(get_piece_by_square(king_destination, result_position)).not.toBeNull()
    expect(get_piece_by_square(king_destination, result_position)?.piece).toBe(Piece.King)

    const rook_destination = make_coordinates(4, 8)  // d8
    expect(get_piece_by_square(rook_destination, result_position)).not.toBeNull()
    expect(get_piece_by_square(rook_destination, result_position)?.piece).toBe(Piece.Rook)

    const king_origin = make_coordinates(5, 8)  // e8
    expect(get_piece_by_square(king_origin, result_position)).toBeNull()

    const rook_origin = make_coordinates(1, 8)  // a8
    expect(get_piece_by_square(rook_origin, result_position)).toBeNull()
})
