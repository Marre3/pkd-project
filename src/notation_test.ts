import { assertArrayIncludes, assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { get_default_board } from "./game.ts";
import { make_coordinates } from "./coordinates.ts";
import { Piece } from "./game_types.ts";
import { move_to_algebraic_notation } from "./notation.ts";
import { position_from_fen } from "./fen.ts";
import { get_legal_moves } from "./moves.ts";


Deno.test("starting_position_move_notation", () => {
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

    assertEquals(nf3, "Nf3")
    assertEquals(d4, "d4")
})

Deno.test("najdorf_moves", () => {
    const board = position_from_fen("rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    assertArrayIncludes(moves, [
        "Nf5", "Ne6", "Nc6", "Ndb5", "Nb3", "Nde2", "Nf3", "e5", "Nd5",
        "Ncb5", "Na4", "Nb1", "Nce2", "a3", "a4", "b3", "b4", "f3",
        "f4", "g3", "g4", "h3", "h4", "Rb1", "Bd2", "Be3", "Bf4",
        "Bg5", "Bh6", "Qd2", "Qd3", "Qe2", "Qf3", "Qg4", "Qh5", "Ke2",
        "Kd2", "Be2", "Bd3", "Bc4", "Bb5+", "Bxa6", "Rg1",
      ]
    )
})

Deno.test("tarrasch_defense_moves", () => {
    const board = position_from_fen("rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    assertArrayIncludes(moves, [
        "cxd5", "dxc5", "Ne4", "Nxd5", "Nb5", "Na4", "Nb1", "a3",
        "a4", "b3", "b4", "e3", "e4", "f3", "f4", "g3", "g4", "h3",
        "h4", "Rb1", "Bd2", "Be3", "Bf4", "Bg5", "Bh6", "Qd2",
        "Qd3", "Qc2", "Qb3", "Qa4+", "Kd2", "Nh3", "Nf3",
      ]
    )
})




Deno.test("berlin_defense_moves", () => {
    const board = position_from_fen("r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4")
    const moves = get_legal_moves(board).map((move) => move_to_algebraic_notation(board, move))
    assertArrayIncludes(moves, [
        "Bxc6", "Bc4", "Bd3", "Be2", "Bf1", "Ba6", "Ba4",
        "Nh4", "Ng5", "Nxe5", "Nd4", "Ng1", "a3", "a4", "b3",
        "b4", "c3", "c4", "d3","d4", "g3", "g4", "h3", "h4",
        "Nc3", "Na3", "Qe2", "Ke2", "Kf1", "O-O", "Rg1", "Rf1",
      ]
    )
})
