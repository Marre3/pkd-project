import { BoardPiece, BoardState, Color } from "./board.ts";
import { Game } from "./game.ts";
import { apply_move, get_legal_moves } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";

function get_piece_value(piece: BoardPiece): number {
    return (piece.color === Color.Black ? -1 : 1)
}

function evaluate_position(state: BoardState): number {
    const material = state.pieces.map(
        (piece) => get_piece_value(piece)
    ).reduce(
        (a, b) => a + b
    )
    return material
}

export function get_engine_move(game: Game): string {
    const move = get_legal_moves(
        game.state
    ).sort(
        (move1, move2) => {
            const eval1 = evaluate_position(apply_move(game.state, move1))
            const eval2 = evaluate_position(apply_move(game.state, move2))
            return eval1 === eval2
                ? 0
                : eval1 > eval2
                ? game.state.turn === Color.White ? 1 : -1
                : game.state.turn === Color.White ? -1 : 1
        }
    ).pop()
    if (move === undefined) {
        throw new Error("Engine error: no moves available")
    } else {
        return move_to_algebraic_notation(game.state, move)
    }
}
