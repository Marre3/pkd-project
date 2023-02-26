import { test } from '@jest/globals'
import { draw, get_default_board } from "everything";

test("test_draw", () => {
    const board = get_default_board()
    draw(board)
})
