import { BoardPiece, BoardState, Color, Coordinates, Move, Moves, Piece } from "./game_types.ts";
import { make_coordinates } from "./coordinates.ts";
import { get_king_position, get_piece_by_square, get_player_pieces, is_bishop, is_king, is_knight, is_pawn, is_queen, is_rook, other_color, out_of_bounds, square_has_piece } from "./board.ts";

function get_regular_moves(piece: BoardPiece, state: BoardState, directions: [number, number][]): Moves {
    const moves: Moves = []
    for (const direction of directions) {
        const pos: Coordinates = { x: piece.square.x + direction[0], y: piece.square.y + direction[1] }

        while (!out_of_bounds(state, pos) && (!square_has_piece(pos, state, piece.color))) {
            moves.push(
                {
                    from: piece.square,
                    to: { x: pos.x, y: pos.y },
                    piece_type: piece.piece,
                    is_capture: square_has_piece(pos, state, other_color(piece.color)),
                    is_castling: false,
                    is_en_passant: false
                }
            )

            if (square_has_piece(pos, state, other_color(piece.color))) {
                break
            }

            pos.x = pos.x + direction[0]
            pos.y = pos.y + direction[1]
        }
    }
    return moves
}

function get_rook_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_regular_moves(piece, state, [[1, 0], [-1, 0], [0, 1], [0, -1]])
}

function get_bishop_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_regular_moves(piece, state, [[1, 1], [1, -1], [-1, 1], [-1, -1]])
}

function get_queen_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_rook_moves(piece, state).concat(get_bishop_moves(piece, state))
}

function get_fixed_distance_moves(piece: BoardPiece, state: BoardState, offsets: [number, number][]): Moves {
    const moves: Moves = []
    for (const offset of offsets) {
        const destination = make_coordinates(piece.square.x + offset[0], piece.square.y + offset[1])
        if (
            ! out_of_bounds(state, destination)
            && ! square_has_piece(destination, state, piece.color)
        ) {
            moves.push(
                {
                    from: piece.square,
                    to: destination,
                    piece_type: piece.piece,
                    is_capture: square_has_piece(destination, state, other_color(piece.color)),
                    is_castling: false,
                    is_en_passant: false
                }
            )
        }
    }
    return moves
}

function get_knight_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_fixed_distance_moves(
        piece,
        state,
        [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]]
    )
}

function get_king_moves(piece: BoardPiece, state: BoardState): Moves {
    // TODO: Castling
    return get_fixed_distance_moves(
        piece,
        state,
        [[1, 1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1], [1, 0], [1, -1]]
    )
}

function get_pawn_moves(piece: BoardPiece, state: BoardState): Moves {
    function get_promotion_moves(to: Coordinates): Moves {
        return [
            Piece.Knight, Piece.Bishop, Piece.Rook, Piece.Queen
        ].map(
            (piece_type) => ({
                from: piece.square,
                to: to,
                piece_type: piece.piece,
                is_capture: square_has_piece(to, state),
                is_castling: false,
                is_en_passant: false,
                promotion_piece: piece_type
            })
        )
    }

    // TODO: google en passant
    // TODO: piece promotion
    let moves: Moves = []
    const one_square_ahead = make_coordinates(
        piece.square.x,
        piece.color === Color.White ? piece.square.y + 1 : piece.square.y - 1
    )
    const two_squares_ahead = make_coordinates(
        piece.square.x,
        piece.color === Color.White ? piece.square.y + 2 : piece.square.y - 2
    )
    const first_capture_square = make_coordinates(
        piece.square.x - 1,
        piece.color === Color.White ? piece.square.y + 1 : piece.square.y - 1
    )
    const second_capture_square = make_coordinates(
        piece.square.x + 1,
        piece.color === Color.White ? piece.square.y + 1 : piece.square.y - 1
    )
    if (! square_has_piece(one_square_ahead, state)) {
        if (
            piece.color === Color.White && piece.square.y === 7
            || piece.color === Color.Black && piece.square.y === 2
            ) {
            moves = moves.concat(get_promotion_moves(one_square_ahead))
        } else {
            moves.push(
                {
                    from: piece.square,
                    to: one_square_ahead,
                    piece_type: piece.piece,
                    is_capture: false,
                    is_castling: false,
                    is_en_passant: false
                }
            )
        }

        if (
            (
                piece.color === Color.White && piece.square.y === 2
                || piece.color === Color.Black && piece.square.y === 7
            )
            && ! square_has_piece(two_squares_ahead, state)
        ) {
            moves.push(
                {
                    from: piece.square,
                    to: two_squares_ahead,
                    piece_type: piece.piece,
                    is_capture: false,
                    is_castling: false,
                    is_en_passant: false
                }
            )
        }
    }
    const en_passant_first_square: boolean = state.en_passant_square !== null
        && state.en_passant_square.x === first_capture_square.x
        && state.en_passant_square.y === first_capture_square.y
    const en_passant_second_square: boolean = state.en_passant_square !== null
        && state.en_passant_square.x === second_capture_square.x
        && state.en_passant_square.y === second_capture_square.y
    if (square_has_piece(first_capture_square, state, other_color(piece.color)) || en_passant_first_square) {
        if (
            piece.color === Color.White && piece.square.y === 7
            || piece.color === Color.Black && piece.square.y === 2
            ) {
            moves = moves.concat(get_promotion_moves(first_capture_square))
        } else {
            moves.push(
                {
                    from: piece.square,
                    to: first_capture_square,
                    piece_type: piece.piece,
                    is_capture: true,
                    is_castling: false,
                    is_en_passant: en_passant_first_square
                }
            )
        }
    }
    if (square_has_piece(second_capture_square, state, other_color(piece.color)) || en_passant_second_square) {
        if (
            piece.color === Color.White && piece.square.y === 7
            || piece.color === Color.Black && piece.square.y === 2
            ) {
            moves = moves.concat(get_promotion_moves(second_capture_square))
        } else {
            moves.push(
                {
                    from: piece.square,
                    to: second_capture_square,
                    piece_type: piece.piece,
                    is_capture: true,
                    is_castling: false,
                    is_en_passant: en_passant_second_square
                }
            )
        }
    }

    return moves
}

function get_piece_moves(piece: BoardPiece, state: BoardState): Moves {
    return is_rook(piece)
        ? get_rook_moves(piece, state)
        : is_bishop(piece)
        ? get_bishop_moves(piece, state)
        : is_queen(piece)
        ? get_queen_moves(piece, state)
        : is_knight(piece)
        ? get_knight_moves(piece, state)
        : is_king(piece)
        ? get_king_moves(piece, state)
        : is_pawn(piece)
        ? get_pawn_moves(piece, state)
        : [] // Should be unreachable
}

export function get_prospective_moves(state: BoardState): Moves {
    return get_player_pieces(state, state.turn).flatMap(
        (piece) => get_piece_moves(piece, state)
    )
}

export function is_check(state: BoardState, color: Color): boolean {
    const king_position = get_king_position(state, color)
    const other_color_state = structuredClone(state)
    other_color_state.turn = other_color(color)
    return get_prospective_moves(
        other_color_state
    ).some(
        (move) => (move.to.x === king_position.x && move.to.y === king_position.y)
    )
}

export function apply_move(state: BoardState, move: Move): BoardState {
    const old_piece = get_piece_by_square(move.from, state)
    if (old_piece == null) {
        throw new Error(`Invalid move ${move}, origin piece does not exist`)
    }
    const new_piece = {
        piece: move.promotion_piece ?? old_piece.piece,
        color: old_piece.color,
        square: move.to
    }

    const en_passant_square = make_coordinates(
        move.to.x,
        move.to.y + (state.turn === Color.White ? -1 : 1)
    )
    const capture_square = move.is_en_passant ? state.en_passant_square! : move.to
    const new_position: BoardState = {
        // TODO: handle castling rights
        pieces: state.pieces.filter(
            (p: BoardPiece) => (
                !(p.square.x === move.from.x && p.square.y === move.from.y)
                && !(p.square.x === capture_square.x && p.square.y === capture_square.y)
            )
        ).concat([new_piece]),
        en_passant_square: en_passant_square,
        turn: other_color(state.turn),
        castling: structuredClone(state.castling),
        halfmove_clock: move.is_capture || move.piece_type === Piece.Pawn ? 0 : state.halfmove_clock + 1,
        fullmove_number: state.fullmove_number + (state.turn === Color.Black ? 1 : 0),
        width: 8,
        height: 8,
    }
    const allows_en_passant = (
        move.piece_type === Piece.Pawn
        && (
            state.turn === Color.White
            ? move.from.y === 2 && move.to.y == 4
            : move.from.y === 7 && move.to.y == 5
        )
        && get_player_pieces(
            new_position, new_position.turn
        ).filter(
            (piece) => piece.piece === Piece.Pawn && piece.square.y === (piece.color === Color.White ? 5 : 4)
        ).flatMap(
            (piece) => get_legal_moves_by_piece(new_position, piece)
        ).some(
            (move) => move.is_en_passant
        )
    )

    if (! allows_en_passant) {
        new_position.en_passant_square = null
    }
    return new_position
}

export function is_self_check(state: BoardState, move: Move) {
    return is_check(apply_move(state, move), state.turn)
}

/** Exclude moves which would put the player's own king in check */
export function get_legal_moves(state: BoardState): Moves {
    return get_prospective_moves(state).filter(
        (move: Move) => ! is_self_check(state, move),
    )
}

export function get_legal_moves_by_piece(state: BoardState, piece: BoardPiece): Moves {
    return get_piece_moves(piece, state).filter(
        (move: Move) => ! is_check(apply_move(state, move), state.turn),
    )
}

export function can_piece_move_to(state: BoardState, piece: BoardPiece, to: Coordinates): boolean {
    return get_legal_moves_by_piece(state, piece).map(
        (m: Move) => m.to
    ).some(
        (c: Coordinates) => c.x === to.x && c.y === to.y
    )
}
