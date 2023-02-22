import { assert } from "https://deno.land/std@0.177.0/testing/asserts.ts";

import { position_from_fen } from "./fen.ts";
import { is_square_controlled_by } from "./board.ts";
import { make_coordinates } from "./coordinates.ts";
import { Color } from "./game_types.ts";

Deno.test("is_square_controlled_by_test", () => {
    const board = position_from_fen("8/8/2k1p3/8/8/5P2/2K5/8 w - - 0 1")
    assert(is_square_controlled_by(board, make_coordinates(4, 3), Color.White))
    assert(is_square_controlled_by(board, make_coordinates(7, 4), Color.White))
    assert(!is_square_controlled_by(board, make_coordinates(6, 4), Color.White))
    assert(is_square_controlled_by(board, make_coordinates(5, 4), Color.White))
    assert(is_square_controlled_by(board, make_coordinates(6, 5), Color.Black))
    assert(!is_square_controlled_by(board, make_coordinates(5, 5), Color.Black))
    assert(is_square_controlled_by(board, make_coordinates(4, 5), Color.Black))
})