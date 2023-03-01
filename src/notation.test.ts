import { test, expect } from '@jest/globals'
import { position_from_fen, get_legal_moves, get_default_board, make_coordinates, Piece, move_to_algebraic_notation, get_letter_by_piece_type } from "everything";

test("starting_position_move_notation", () => {
    const board = get_default_board()
    const nf3 = move_to_algebraic_notation(
        board,
        {
            from: make_coordinates(7, 1),
            to: make_coordinates(6, 3),
            piece_type: Piece.Knight,
            is_capture: false,
            is_castling_kingside: false,
            is_castling_queenside: false,
            is_en_passant: false
        }
    )
    const d4 = move_to_algebraic_notation(
        board,
        {
            from:
            make_coordinates(4, 2),
            to: make_coordinates(4, 4),
            piece_type: Piece.Pawn,
            is_capture: false,
            is_castling_kingside: false,
            is_castling_queenside: false,
            is_en_passant: false
        }
    )

    expect(nf3).toBe("Nf3")
    expect(d4).toBe("d4")
})

test("najdorf_moves", () => {
    const board = position_from_fen("rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    const expected = [
        "Nf5", "Ne6", "Nc6", "Ndb5", "Nb3", "Nde2", "Nf3", "e5", "Nd5",
        "Ncb5", "Na4", "Nb1", "Nce2", "a3", "a4", "b3", "b4", "f3",
        "f4", "g3", "g4", "h3", "h4", "Rb1", "Bd2", "Be3", "Bf4",
        "Bg5", "Bh6", "Qd2", "Qd3", "Qe2", "Qf3", "Qg4", "Qh5", "Ke2",
        "Kd2", "Be2", "Bd3", "Bc4", "Bb5+", "Bxa6", "Rg1",
    ]
    expect(moves).toEqual(expect.arrayContaining(expected))
    expect(moves).toHaveLength(expected.length)
})

test("tarrasch_defense_moves", () => {
    const board = position_from_fen("rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    const expected = [
        "cxd5", "dxc5", "Ne4", "Nxd5", "Nb5", "Na4", "Nb1", "a3",
        "a4", "b3", "b4", "e3", "e4", "f3", "f4", "g3", "g4", "h3",
        "h4", "Rb1", "Bd2", "Be3", "Bf4", "Bg5", "Bh6", "Qd2",
        "Qd3", "Qc2", "Qb3", "Qa4+", "Kd2", "Nh3", "Nf3",
    ]
    expect(moves).toEqual(expect.arrayContaining(expected))
    expect(moves).toHaveLength(expected.length)
})

test("berlin_defense_moves", () => {
    const board = position_from_fen("r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    const expected = [
        "Bxc6", "Bc4", "Bd3", "Be2", "Bf1", "Ba6", "Ba4",
        "Nh4", "Ng5", "Nxe5", "Nd4", "Ng1", "a3", "a4", "b3",
        "b4", "c3", "c4", "d3","d4", "g3", "g4", "h3", "h4",
        "Nc3", "Na3", "Qe2", "Ke2", "Kf1", "O-O", "Rg1", "Rf1",
    ]
    expect(moves).toEqual(expect.arrayContaining(expected))
    expect(moves).toHaveLength(expected.length)
})

test("multiple_knights", () => {
    const board = position_from_fen("8/8/1k3N2/8/1N3N2/3KN3/8/8 w - - 0 1")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    const expected = [
        "Kc4", "Kd4", "Ke4", "Kc3", "Kc2", "Kd2", "Ke2", "Na6", "Na2", "Nbc2",
        "Nc6", "Nd7+", "Ne8", "Ng8", "Nh7", "N6h5", "Nfg4", "Ne4", "Ne6",
        "Ng6", "N4h5", "Nh3", "Nfg2", "Ne2", "Nf5", "Neg4", "Neg2", "Nf1",
        "Nd1", "Nec2", "Nc4+", "Nbd5+", "Ned5+", "N6d5+", "Nf4d5+",
    ]
    expect(moves.sort()).toEqual(expected.sort())
})

test("get_letter_by_piece_type", () => {
    expect(get_letter_by_piece_type(Piece.Bishop)).toBe("B")
    expect(get_letter_by_piece_type(Piece.King)).toBe("K")
    expect(get_letter_by_piece_type(Piece.Queen)).toBe("Q")
    expect(get_letter_by_piece_type(Piece.Rook)).toBe("R")
    expect(get_letter_by_piece_type(Piece.Knight)).toBe("N")
    expect(get_letter_by_piece_type(Piece.Pawn)).toBe("P")
})


test("promotion_moves", () => {
    const board = position_from_fen("4b1nK/3k1P2/8/8/8/8/8/8 w - - 0 1")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    const expected = [
        "fxe8=B+", "fxe8=N", "fxe8=R", "fxe8=Q+",
        "fxg8=B", "fxg8=N", "fxg8=R", "fxg8=Q",
        "f8=B", "f8=N+", "f8=R", "f8=Q",
        "Kxg8", "Kg7", "Kh7"
    ]
    expect(moves.sort()).toEqual(expected.sort())
})

test("queenside_castle", () => {
    const board = position_from_fen("rn3r2/pbppq1p1/1p2pN2/8/3P2NP/6P1/PPP1BP1R/R3K1k1 w Q - 5 18")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    expect(moves).toEqual(expect.arrayContaining(["O-O-O#"]))
})
