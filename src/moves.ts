import {
    make_coordinates, coordinates_eq, Coordinates
} from "./coordinates.ts";
import {
    get_king_position, get_piece_by_square, get_player_pieces,
    is_piece, is_bishop, is_king, is_knight, is_queen, is_rook,
    other_color, out_of_bounds, square_has_piece,
    BoardPiece, BoardState, CastlingRights, Piece, Color
} from "./board.ts";


export type Move = {
    from: Coordinates,
    to: Coordinates,
    piece_type: Piece,
    is_capture: boolean,
    is_castling_kingside: boolean,
    is_castling_queenside: boolean,
    is_en_passant: boolean,
    promotion_piece?: Piece
}
export type Moves = Array<Move>
type Direction = [number, number]

/**
 * Get all prospective (could be illegal) moves in a given direction for a piece
 * @param piece - the piece to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @param pos - starting position for the move search
 * @returns an array with all the prospective moves in the direction
 */
function get_moves_in_direction(
    piece: BoardPiece,
    state: BoardState,
    pos: Coordinates,
    direction: Direction
): Moves {
    const next_square = make_coordinates(
        pos.x + direction[0],
        pos.y + direction[1]
    )
    return out_of_bounds(state, pos)
        || square_has_piece(pos, state, piece.color)
        ? []
        : Array.prototype.concat(
            {
                from: piece.square,
                to: { x: pos.x, y: pos.y },
                piece_type: piece.piece,
                is_capture: square_has_piece(
                    pos, state, other_color(piece.color)
                ),
                is_castling_kingside: false,
                is_castling_queenside: false,
                is_en_passant: false
            },
            square_has_piece(pos, state, other_color(piece.color))
            ? []
            : get_moves_in_direction(piece, state, next_square, direction)
        )
}

/**
 * Get all prospective (could be illegal) moves in given directions for a piece
 * @param piece - the piece to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @param direction - array of the directions to get prospective moves in
 * @returns an array with all the prospective moves in the directions
 */
function get_linear_moves(
    piece: BoardPiece,
    state: BoardState,
    directions: Array<Direction>
): Moves {
    return directions.flatMap(
        (dir) => get_moves_in_direction(
            piece,
            state,
            make_coordinates(piece.square.x + dir[0], piece.square.y + dir[1]),
            dir
        )
    )
}

/**
 * Get all prospective (could be illegal) moves for a given rook
 * @param piece - the rook to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @returns an array with all the prospective moves for the rook
 */
function get_rook_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_linear_moves(piece, state, [[1, 0], [-1, 0], [0, 1], [0, -1]])
}

/**
 * Get all prospective (could be illegal) moves for a given bishop
 * @param piece - the bishop to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @returns an array with all the prospective moves for the bishop
 */
function get_bishop_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_linear_moves(piece, state, [[1, 1], [1, -1], [-1, 1], [-1, -1]])
}

/**
 * Get all prospective (could be illegal) moves for a given queen
 * @param piece - the queen to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @returns an array with all the prospective moves for the queen
 */
function get_queen_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_rook_moves(piece, state).concat(get_bishop_moves(piece, state))
}

/**
 * Get all prospective (could be illegal) moves in
 * given fixed distances from a piece
 * @param piece - the piece to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @param offsets - the fixed distances from the piece
 * @returns an array with all the prospective moves in
 * the fixed distances from the piece
 */
function get_fixed_distance_moves(
    piece: BoardPiece,
    state: BoardState,
    offsets: Array<[number, number]>
): Moves {
    return offsets.map(
        (offset) => make_coordinates(
            piece.square.x + offset[0],
            piece.square.y + offset[1]
        )
    ).filter(
        (destination) => ! (
            out_of_bounds(state, destination)
            || square_has_piece(destination, state, piece.color)
        )
    ).map(
        (destination) => ({
            from: piece.square,
            to: destination,
            piece_type: piece.piece,
            is_capture: square_has_piece(
                destination, state, other_color(piece.color)
            ),
            is_castling_kingside: false,
            is_castling_queenside: false,
            is_en_passant: false
        })
    )
}

/**
 * Get all prospective (could be illegal) moves for a given knight
 * @param piece - the knight to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @returns an array with all the prospective moves for the knight
 */
function get_knight_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_fixed_distance_moves(
        piece,
        state,
        [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]]
    )
}

/**
 * Get all prospective (could be illegal) moves for a given king
 * @param piece - the king to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @returns an array with all the prospective moves for the king
 */
function get_king_moves(piece: BoardPiece, state: BoardState): Moves {
    let moves = get_fixed_distance_moves(
        piece,
        state,
        [[1, 1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1], [1, 0], [1, -1]]
    )

    function add_castle_move(
        king_position: Coordinates,
        to: Coordinates,
        kingside: boolean
    ): void {
        moves = moves.concat({
            from: king_position,
            to: to,
            piece_type: Piece.King,
            is_capture: false,
            is_castling_kingside: kingside,
            is_castling_queenside: ! kingside,
            is_en_passant: false
        })
    }

    if (state.turn === Color.White) {
        if (state.castling.white_kingside) {
            add_castle_move(piece.square, make_coordinates(7, 1), true)
        }
        if (state.castling.white_queenside) {
            add_castle_move(piece.square, make_coordinates(3, 1), false)
        }
    } else {
        if (state.castling.black_kingside) {
            add_castle_move(piece.square, make_coordinates(7, 8), true)
        }
        if (state.castling.black_queenside) {
            add_castle_move(piece.square, make_coordinates(3, 8), false)
        }
    }

    return moves
}

/**
 * Get all prospective (could be illegal) moves for a given pawn
 * @param piece - the pawn to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @returns an array with all the prospective moves for the pawn
 */
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
                is_castling_kingside: false,
                is_castling_queenside: false,
                is_en_passant: false,
                promotion_piece: piece_type
            })
        )
    }
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
    const seventh_rank = piece.color === Color.White ? 7 : 2
    const second_rank = piece.color === Color.White ? 2 : 7
    return [
        first_capture_square, second_capture_square
    ].flatMap(
        (square) => (
            square_has_piece(square, state, other_color(piece.color))
            || state.en_passant_square !== null
            && coordinates_eq(state.en_passant_square, square)
        )
        ? piece.square.y === seventh_rank
            ? get_promotion_moves(square)
            : {
                from: piece.square,
                to: square,
                piece_type: piece.piece,
                is_capture: true,
                is_castling_kingside: false,
                is_castling_queenside: false,
                is_en_passant: state.en_passant_square !== null
                    && coordinates_eq(state.en_passant_square, square)
            }
        : []
    ).concat(
        square_has_piece(one_square_ahead, state)
        ? []
        : Array.prototype.concat(
            piece.square.y === seventh_rank
            ? get_promotion_moves(one_square_ahead)
            : {
                from: piece.square,
                to: one_square_ahead,
                piece_type: piece.piece,
                is_capture: false,
                is_castling_kingside: false,
                is_castling_queenside: false,
                is_en_passant: false
            },
            (piece.square.y !== second_rank)
                || square_has_piece(two_squares_ahead, state)
            ? []
            : {
                from: piece.square,
                to: two_squares_ahead,
                piece_type: piece.piece,
                is_capture: false,
                is_castling_kingside: false,
                is_castling_queenside: false,
                is_en_passant: false
            }
        )
    )
}

/**
 * Get all prospective (could be illegal) moves for any given piece
 * @param piece - the piece to get the prospective moves for
 * @param state - the BoardState to get the prospective moves in
 * @returns an array with all the prospective moves for the piece
 */
export function get_piece_moves(piece: BoardPiece, state: BoardState): Moves {
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
           : get_pawn_moves(piece, state)
}

/**
 * Get all prospective (could be illegal) moves in a given BoardState
 * @param state - the BoardState to get the prospective moves in
 * @returns an array with all the prospective moves in state
 */
export function get_prospective_moves(state: BoardState): Moves {
    return get_player_pieces(state, state.turn).flatMap(
        (piece) => get_piece_moves(piece, state)
    )
}

/**
 * Determine if the king of a given color is in check
 * @param state - the BoardState to consider
 * @param color - the given color for the king
 * @returns true if the king is in check, false otherwise
 */
export function is_check(state: BoardState, color: Color): boolean {
    const king_position = get_king_position(state, color)
    const other_color_state = structuredClone(state)
    other_color_state.turn = other_color(color)
    return get_prospective_moves(
        other_color_state
    ).some(
        (move) => coordinates_eq(move.to, king_position)
    )
}

/**
 * Get the new position after applying a given move to a BoardState
 * @param state - the BoardState to apply the move to
 * @param move - the move to apply to state
 * @returns a BoardState of the new position after the move was applied
 * @throws an error if there is no piece in state at the origin square of move
 */
export function apply_move(state: BoardState, move: Move): BoardState {
    const old_piece = get_piece_by_square(move.from, state)
    if (old_piece === null) {
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
    const capture_square = move.is_en_passant ? en_passant_square : move.to
    const new_position: BoardState = {
        pieces: structuredClone(state.pieces).filter(
            (p: BoardPiece) => (
                !coordinates_eq(p.square, move.from)
                && !coordinates_eq(p.square, capture_square)
            )
        ).concat([new_piece]),
        en_passant_square: en_passant_square,
        turn: other_color(state.turn),
        castling: structuredClone(state.castling),
        halfmove_clock: move.is_capture || move.piece_type === Piece.Pawn
                        ? 0
                        : state.halfmove_clock + 1,
        fullmove_number: state.fullmove_number
            + (state.turn === Color.Black ? 1 : 0),
        width: 8,
        height: 8
    }
    const allows_en_passant = (
        move.piece_type === Piece.Pawn
        && (
            state.turn === Color.White
            ? move.from.y === 2 && move.to.y === 4
            : move.from.y === 7 && move.to.y === 5
        )
        && get_player_pieces(
            new_position, new_position.turn
        ).filter(
            (piece) => piece.piece === Piece.Pawn
                && piece.square.y === (piece.color === Color.White ? 5 : 4)
        ).flatMap(
            (piece) => get_legal_moves_by_piece(new_position, piece)
        ).some(
            (move) => move.is_en_passant
        )
    )

    if (! allows_en_passant) {
        new_position.en_passant_square = null
    }

    if (move.is_castling_kingside) {
        const rook = get_piece_by_square(
            make_coordinates(8, state.turn === Color.White ? 1 : 8),
            new_position
        )
        if (rook !== null) {
            rook.square.x = 6
        }
    }

    if (move.is_castling_queenside) {
        const rook = get_piece_by_square(
            make_coordinates(1, state.turn === Color.White ? 1 : 8),
            new_position
        )

        if (rook !== null) {
            rook.square.x = 4
        }
    }

    function update_castling_rights(castling: CastlingRights) {
        if (state.turn === Color.White) {
            if (move.piece_type === Piece.King) {
                castling.white_kingside = false
                castling.white_queenside = false
            }

            if (move.piece_type === Piece.Rook) {
                if (move.from.x === 8 && move.from.y === 1) {
                    castling.white_kingside = false
                } else if (move.from.x === 1 && move.from.y === 1) {
                    castling.white_queenside = false
                }
            }
        } else {
            if (move.piece_type === Piece.King) {
                castling.black_kingside = false
                castling.black_queenside = false
            }

            if (move.piece_type === Piece.Rook) {
                if (move.from.x === 8 && move.from.y === 8) {
                    castling.black_kingside = false
                } else if (move.from.x === 1 && move.from.y === 8) {
                    castling.black_queenside = false
                }
            }
        }
    }

    update_castling_rights(new_position.castling)

    return new_position
}

/**
 * Determine if a given move would lead to self-check
 * @param state - the BoardState to consider the move in
 * @param move - the given move
 * @returns true if move would lead to self-check, false otherwise
 */
export function is_self_check(state: BoardState, move: Move) {
    return is_check(apply_move(state, move), state.turn)
}

/**
 * Determine if a given castle move is legal in a given BoardState
 * @param state - the BoardState to consider the castle move in
 * @param move - the given castle move
 * @returns true if move is a legal move in state, false otherwise
 */
function is_castle_legal(state: BoardState, move: Move) {
    function free_between_on_rank(from: Coordinates, to_file: number): boolean {
        const direction = from.x < to_file ? 1 : -1
        const pos = make_coordinates(from.x + direction, from.y)
        return pos.x === to_file
            || (
                ! square_has_piece(pos, state)
                && ! is_square_attacked_by(state, pos, other_color(state.turn))
                && free_between_on_rank(pos, to_file)
            )
    }
    const back_rank_number = state.turn === Color.White ? 1 : 8
    const rook_square = make_coordinates(
        move.is_castling_kingside ? 8 : 1,
        back_rank_number
    )

    const rook = get_piece_by_square(rook_square, state)

    return coordinates_eq(move.from, make_coordinates(5, back_rank_number))
        && is_piece(rook)
        && is_rook(rook)
        && move.from.y === move.to.y
        && ! (
            move.is_castling_queenside
            && square_has_piece(
                make_coordinates(rook_square.x + 1, back_rank_number), state
            )
        )
        && free_between_on_rank(
            move.from,
            move.is_castling_kingside ? rook_square.x : rook_square.x + 1
        )
        && ! is_check(state, state.turn)
}

/**
 * Check if a certain square is attacked by any piece of a given color
 * @param state - the BoardState to consider
 * @param square - coordinates to the square
 * @param color - the given color
 * @returns true if the square is attacked by any piece of
 * the given color, false otherwise
 */
export function is_square_attacked_by(
    state: BoardState,
    square: Coordinates,
    color: Color
): boolean {
    function squares_attacked_by_piece(
        board_state: BoardState,
        piece: BoardPiece
    ): Array<Coordinates> {
        return piece.piece === Piece.Pawn
            ? [make_coordinates(
                piece.square.x - 1,
                color === Color.White ? piece.square.y + 1 : piece.square.y - 1
            ), make_coordinates(
                piece.square.x + 1,
                color === Color.White ? piece.square.y + 1 : piece.square.y - 1
            )]
            : piece.piece === Piece.King
            ? get_piece_moves(piece, board_state)
                .filter((m: Move) => ! (
                    m.is_castling_kingside || m.is_castling_queenside
                ))
                .map((m: Move) => m.to)
            : get_piece_moves(piece, board_state).map((m: Move) => m.to)
    }

    function other_color_state(board_state: BoardState): BoardState {
        const other_color_state = structuredClone(board_state)
        other_color_state.turn = other_color(board_state.turn)
        return other_color_state
    }

    const state_to_use = color === state.turn ? state : other_color_state(state)

    return get_player_pieces(state_to_use, color)
            .flatMap(piece => squares_attacked_by_piece(state_to_use, piece))
            .some(
                controlled_square => coordinates_eq(controlled_square, square)
            )
}

/**
 * Get all legal moves in a given BoardState by
 * excluding moves which would put the player's own
 * king in check and illegal castle moves
 * @param state - the BoardState to get the legal moves in
 * @returns an array with all the legal moves in state
 */
export function get_legal_moves(state: BoardState): Moves {
    return get_prospective_moves(state).filter(
        (move: Move) => (
            move.is_castling_kingside || move.is_castling_queenside
        ) ? is_castle_legal(state, move) : ! is_self_check(state, move)
    )
}

/**
 * Get all legal moves by a specific piece in a given BoardState
 * @param state - the BoardState to get the legal moves in
 * @param piece - the piece to get the legal moves for
 * @returns an array with all the legal moves for piece in state
 */
export function get_legal_moves_by_piece(
    state: BoardState,
    piece: BoardPiece
): Moves {
    return get_piece_moves(piece, state).filter(
        (move: Move) => (
            move.is_castling_kingside || move.is_castling_queenside
        ) ? is_castle_legal(state, move) : ! is_self_check(state, move)
    )
}

/**
 * Determine if a given piece can move to a specific square
 * @param state - the BoardState to consider the move in
 * @param piece - the given piece
 * @param to - the coordinates for the square
 * @returns true if piece can move to the square, false otherwise
 */
export function can_piece_move_to(
    state: BoardState,
    piece: BoardPiece,
    to: Coordinates
): boolean {
    return get_legal_moves_by_piece(state, piece).map(
        (m: Move) => m.to
    ).some(
        (c: Coordinates) => coordinates_eq(c, to)
    )
}
