import {BoardState, get_default_board, get_legal_moves, move_to_algebraic_notation, get_piece_by_square, get_letter_by_piece, make_coordinates} from "./chess.ts"

function draw(state: BoardState): void {
    for (let y = 8; y >= 1; --y) {
        let s = ""
        for (let x = 1; x <= 8; ++x) {
            const p = get_piece_by_square(make_coordinates(x, y), state)

            s = s + " " + get_letter_by_piece(p) + " "
        }
        console.log(s)
    }
}
const board = get_default_board()

draw(board)

for (const move of get_legal_moves(board)) {
    console.log(move_to_algebraic_notation(board, move))
}
