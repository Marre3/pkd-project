import {
    BoardPiece, BoardState, Color, is_bishop, is_king,
    is_knight, is_queen, is_rook, Piece
} from "./board.ts";
import { Game, is_checkmate, is_stalemate } from "./game.ts";
import { apply_move, get_legal_moves, Move } from "./moves.ts";
import { move_to_algebraic_notation } from "./notation.ts";

type MoveEval = {
    move?: Move,
    eval: number
}

const initial_depth = 3

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

function search(state: BoardState, depth: number): MoveEval {
    if (depth === 0) {
        return {eval: evaluate_position(state)}
    }
    const legal_moves = get_legal_moves(state)
    const initial_evaluations = legal_moves.map(
        (move) => {
            const new_state = apply_move(state, move)
            return {
                state: new_state,
                move: move,
                eval: evaluate_position(new_state)
            }
        }
    )
    const preliminary = initial_evaluations.sort(
        (a, b) => {
            return a.eval === b.eval
                ? 0
                : a.eval < b.eval
                ? state.turn === Color.White ? 1 : -1
                : state.turn === Color.White ? -1 : 1
        }
    ).slice(0, Math.ceil(legal_moves.length * 4**(-initial_depth+depth-1)))
    const initial_best = preliminary.at(0)
    if (initial_best === undefined) {
        return { eval: evaluate_position(state) }
    } else if (
        state.turn === Color.White && initial_best.eval > 99
        || state.turn === Color.Black && initial_best.eval < -99
    ) {
        return {eval: initial_best.eval, move: initial_best.move}
    }
    const searched_moves: Array<MoveEval> = preliminary.map(
        (move_state) => ({
            eval: search(move_state.state, depth - 1).eval,
            move: move_state.move
        })
    )
    searched_moves.sort(
        (a, b) => {
            return a.eval === b.eval
                ? 0
                : a.eval < b.eval
                ? state.turn === Color.White ? 1 : -1
                : state.turn === Color.White ? -1 : 1
        }
    )

    // Debugging
    if (depth === initial_depth) {
        for (const move of searched_moves) {
            if (move.move !== undefined) {
                console.log(move_to_algebraic_notation(state, move.move), move.eval)
            } else {
                console.log(move.eval)
            }
        }
    }

    const move = searched_moves.at(0)
    return move ?? {eval: 0}
}

function evaluate_position(state: BoardState): number {
    return is_checkmate(state)
        ? state.turn === Color.White
            ? -100
            : 100
        : is_stalemate(state)
        ? 0
        : state.pieces.map(
            (piece) => get_piece_value(piece)
        ).reduce(
            (a, b) => a + b
        )
}

export function get_engine_move(game: Game): string {
    console.log("get engine move")
    const move = search(game.state, initial_depth)
    if (move.move === undefined) {
        throw new Error("Engine error: search didn't return a move")
    }
    console.log(move.eval)
    return move_to_algebraic_notation(game.state, move.move)
}
