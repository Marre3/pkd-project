import { make_coordinates } from "./coordinates.ts"
import { BoardState, get_piece_by_square } from "./board.ts";
import { get_letter_by_piece } from "./notation.ts";

/**
 * Print an ASCII-representation of a BoardState to standard output
 * @param state - the BoardState to print
 */
export function draw(state: BoardState): void {
    for (let y = 8; y >= 1; --y) {
        let s = ""
        for (let x = 1; x <= 8; ++x) {
            const p = get_piece_by_square(make_coordinates(x, y), state)

            s = s + " " + get_letter_by_piece(p) + " "
        }
        console.log(s)
    }
}
