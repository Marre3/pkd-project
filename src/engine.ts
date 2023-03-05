import {
    BoardPiece, BoardState, Color, is_bishop, is_king,
    is_knight, is_queen, is_rook, Piece
} from "./board.ts";
import { Game, is_checkmate, is_stalemate } from "./game.ts";
import { apply_move, get_legal_moves, is_check, Move } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";

type MoveEval = {
    move?: Move,
    eval: number
}

// A record of a move with its corresponding initial evaluation, along with
// the resulting position after the move is played
type MoveEvalPosition = {
    move: Move,
    eval: number,
    state: BoardState
}

// The initial search depth of the engine. Can be increased to increase the
// strength of the engine at the cost of longer execution time.
const initial_depth = 3

/**
 * Get the approximate value of a piece according to the engine.
 * This is based on piece type and position.
 * @param piece - The piece to get the value of
 * @returns The value of the piece
 */
function get_piece_value(piece: BoardPiece): number {
    const color_coefficient = piece.color === Color.White ? 1 : -1
    const base_value = is_bishop(piece)
        ? 3
        : is_knight(piece)
        ? 3
        : is_rook(piece)
        ? 5
        : is_queen(piece)
        ? 9
        : 1
    let positional_modifier = 1
    const relative_y = piece.color === Color.White
        ? piece.square.y
        : 9 - piece.square.y
    if (is_knight(piece)) {
        if (
            (piece.square.x === 5 || piece.square.x === 4)
            && (piece.square.y === 5 || piece.square.y === 4)
        ) {
            positional_modifier = 1.3
        } else if (
            (piece.square.x === 3 || piece.square.x === 6)
            && (piece.square.y === 5 || piece.square.y === 4)
        ) {
            positional_modifier = 1.2
        } else if (
            (piece.square.x === 4 || piece.square.x === 4)
            && (piece.square.y === 3 || piece.square.y === 6)
        ) {
            positional_modifier = 1.15
        } else if (
            (piece.square.x === 3 || piece.square.x === 6)
            && (piece.square.y === 3 || piece.square.y === 6)
        ) {
            positional_modifier = 1.1
        }
    }
    if (is_bishop(piece)) {
        if (
            (piece.square.x === 5 || piece.square.x === 4)
            && (piece.square.y === 5 || piece.square.y === 4)
        ) {
            positional_modifier = 1.3
        } else if (
            (piece.square.x === 3 || piece.square.x === 6)
            && (piece.square.y === 5 || piece.square.y === 4)
        ) {
            positional_modifier = 1.2
        } else if (
            (piece.square.x === 4 || piece.square.x === 4)
            && (piece.square.y === 3 || piece.square.y === 6)
        ) {
            positional_modifier = 1.15
        } else if (
            (piece.square.x === 3 || piece.square.x === 6)
            && (piece.square.y === 3 || piece.square.y === 6)
        ) {
            positional_modifier = 1.1
        }
    }
    if (piece.piece === Piece.Pawn) {
        positional_modifier = 0.8 + 0.1 * relative_y
        if (piece.square.x > 2 && piece.square.x < 6) {
            positional_modifier *= 1.2
        } else if (piece.square.x === 1 || piece.square.x === 8) {
            positional_modifier *= 1.1
        }
    }
    if (is_king(piece)) {
        positional_modifier = 1 - 0.2 * relative_y
        if (piece.square.x > 6) {
            positional_modifier *= 1.2
        } else if (piece.square.x < 4) {
            positional_modifier *= 1.2
        }
    }
    return color_coefficient * positional_modifier * base_value
}

/**
 * Internal engine function to compute different lines in a position to
 * evaluate the position and try to find the best move.
 * @param state - The board state to search
 * @param depth - The maximum depth to search before terminating
 * @returns A struct containing the evaluation of the position
 * and the best move, according to the engine, in the position
 */
function search(state: BoardState, depth: number): MoveEval {
    if (depth === 0) {
        return {eval: evaluate_position(state)}
    }
    const legal_moves = get_legal_moves(state)
    const initial_evaluations: Array<MoveEvalPosition> = legal_moves.map(
        (move) => {
            const new_state = apply_move(state, move)
            return {
                state: new_state,
                move: move,
                eval: evaluate_position(new_state)
            }
        }
    )

    // Sort the available moves and eliminate moves which are likely to be bad
    const preliminary = initial_evaluations.sort(
        (a, b) => {
            return a.eval === b.eval
                ? 0
                : a.eval < b.eval
                ? state.turn === Color.White ? 1 : -1
                : state.turn === Color.White ? -1 : 1
        }
    ).slice(
        0,
        Math.ceil(legal_moves.length * 4 ** (-initial_depth + depth - 1))
    )  // Evaluate a lower proportion of moves at a higher depth for performance

    const initial_best = preliminary.at(0)
    if (initial_best === undefined) {
        return { eval: evaluate_position(state) }
    } else if (
        state.turn === Color.White && initial_best.eval > 99
        || state.turn === Color.Black && initial_best.eval < -99
    ) {
        return {eval: initial_best.eval, move: initial_best.move}
    }

    // Recursively search the moves which were deemed promising
    const searched_moves: Array<MoveEval> = preliminary.map(
        (move_state) => ({
            eval: search(move_state.state, depth - 1).eval,
            move: move_state.move
        })
    )

    // Sort the searched moves from best to worst and return the best move
    searched_moves.sort(
        (a, b) => {
            return a.eval === b.eval
                ? 0
                : a.eval < b.eval
                ? state.turn === Color.White ? 1 : -1
                : state.turn === Color.White ? -1 : 1
        }
    )
    const move = searched_moves.at(0)
    return move ?? {eval: 0}

    // Debugging
    // if (depth === initial_depth) {
    //     for (const move of searched_moves) {
    //         if (move.move !== undefined) {
    //             console.log(move_to_algebraic_notation(state, move.move), move.eval)
    //         } else {
    //             console.log(move.eval)
    //         }
    //     }
    // }

}

/**
 * Internal engine function to give a simple evaluation with regards to
 * material balance, placement of pieces and whether
 * the position is checkmate/stalemate
 * @param state - The board state to evaluate
 * @returns A number representing the evaluation of the state, where a negative
 * number means that the position is good for black and a positive number means
 * the position is good for white.
 */
function evaluate_position(state: BoardState): number {
    const no_moves = get_legal_moves(state).length === 0
    return no_moves
        ? is_check(state, state.turn)
            ? state.turn === Color.White
                ? -100
                : 100
            : 0
        : state.pieces.map(
            (piece) => get_piece_value(piece)
        ).reduce(
            (a, b) => a + b
        )
}

/**
 * Get the best move in a position according to our chess engine
 * (Beware: the engine is not very good...)
 * @param game - The Game to find the best move in.
 * @returns A string containing the suggested move in algebraic notation
 */
export function get_engine_move(game: Game): string {
    const move = search(game.state, initial_depth)
    if (move.move === undefined) {
        throw new Error("Engine error: search didn't return a move")
    }
    return move_to_algebraic_notation(game.state, move.move)
}
