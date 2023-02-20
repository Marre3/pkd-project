import { get_default_board } from "./chess.ts";
import { draw } from "./draw.ts";

Deno.test("test_draw", () => {
    const board = get_default_board()
    draw(board)
})
