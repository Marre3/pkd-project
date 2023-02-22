import { BoardPiece, BoardState, Color, CastlingRights, Coordinates, Move, Moves, Piece } from "./game_types.ts";
import { make_coordinates, coordinates_eq } from "./coordinates.ts";
import { get_king_position, get_piece_by_square, get_player_pieces, is_piece, is_bishop, is_king, is_knight, is_pawn, is_queen, is_rook, other_color, out_of_bounds, square_has_piece, is_square_controlled_by } from "./board.ts";

type Direction = [number, number]

function get_moves_in_direction(piece: BoardPiece, state: BoardState, pos: Coordinates, direction: Direction): Moves {
    const next_square = make_coordinates(pos.x + direction[0], pos.y + direction[1])
    return out_of_bounds(state, pos) || square_has_piece(pos, state, piece.color)
        ? []
        : Array.prototype.concat(
            {
                from: piece.square,
                to: { x: pos.x, y: pos.y },
                piece_type: piece.piece,
                is_capture: square_has_piece(pos, state, other_color(piece.color)),
                is_castling_kingside: false,
                is_castling_queenside: false,
                is_en_passant: false
            },
            square_has_piece(pos, state, other_color(piece.color))
                ? []
                : get_moves_in_direction(piece, state, next_square, direction)
        )
}

function get_linear_moves(piece: BoardPiece, state: BoardState, directions: Direction[]): Moves {
    return directions.flatMap(
        (dir) => get_moves_in_direction(
            piece,
            state,
            make_coordinates(piece.square.x + dir[0], piece.square.y + dir[1]),
            dir
        )
    )
}

function get_rook_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_linear_moves(piece, state, [[1, 0], [-1, 0], [0, 1], [0, -1]])
}

function get_bishop_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_linear_moves(piece, state, [[1, 1], [1, -1], [-1, 1], [-1, -1]])
}

function get_queen_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_rook_moves(piece, state).concat(get_bishop_moves(piece, state))
}

function get_fixed_distance_moves(piece: BoardPiece, state: BoardState, offsets: [number, number][]): Moves {
    return offsets.map(
        (offset) => make_coordinates(piece.square.x + offset[0], piece.square.y + offset[1])
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
            is_capture: square_has_piece(destination, state, other_color(piece.color)),
            is_castling_kingside: false,
            is_castling_queenside: false,
            is_en_passant: false
        })
    )
}

function get_knight_moves(piece: BoardPiece, state: BoardState): Moves {
    return get_fixed_distance_moves(
        piece,
        state,
        [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]]
    )
}

function get_king_moves(piece: BoardPiece, state: BoardState): Moves {
    let moves = get_fixed_distance_moves(
        piece,
        state,
        [[1, 1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1], [1, 0], [1, -1]]
    )

    function add_castle_move(king_position: Coordinates, to: Coordinates, kingside: boolean): void {
        moves = moves.concat({
            from: king_position,
            to: to,
            piece_type: Piece.King,
            is_capture: false,
            is_castling_kingside: kingside,
            is_castling_queenside: !kingside,
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
        (move) => coordinates_eq(move.to, king_position)
    )
}

export function apply_move(state: BoardState, move: Move): BoardState {
    const stateClone = structuredClone(state)
    const old_piece = get_piece_by_square(move.from, stateClone)
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
        move.to.y + (stateClone.turn === Color.White ? -1 : 1)
    )
    const capture_square = move.is_en_passant ? en_passant_square : move.to
    const new_position: BoardState = {
        // TODO: handle castling rights
        pieces: stateClone.pieces.filter(
            (p: BoardPiece) => (
                !coordinates_eq(p.square, move.from)
                && !coordinates_eq(p.square, capture_square)
            )
        ).concat([new_piece]),
        en_passant_square: en_passant_square,
        turn: other_color(stateClone.turn),
        castling: stateClone.castling,
        halfmove_clock: move.is_capture || move.piece_type === Piece.Pawn ? 0 : stateClone.halfmove_clock + 1,
        fullmove_number: stateClone.fullmove_number + (stateClone.turn === Color.Black ? 1 : 0),
        width: 8,
        height: 8,
    }
    const allows_en_passant = (
        move.piece_type === Piece.Pawn
        && (
            stateClone.turn === Color.White
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

    if (move.is_castling_kingside) {
        const rook = new_position.pieces.find((p: BoardPiece) => coordinates_eq(p.square, state.turn === Color.White
            ? make_coordinates(8, 1)
            : make_coordinates(8, 8))) ?? null
        
        if (rook !== null) {
            rook.square.x = 6
        }
    }

    if (move.is_castling_queenside) {
        const rook = new_position.pieces.find((p: BoardPiece) => coordinates_eq(p.square, state.turn === Color.White
            ? make_coordinates(1, 1)
            : make_coordinates(1, 8))) ?? null
        
        if (rook !== null) {
            rook.square.x = 4
        }
    }

    function update_castling_rights(castling: CastlingRights) {
        if (stateClone.turn === Color.White) {
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

export function is_self_check(state: BoardState, move: Move) {
    return is_check(apply_move(state, move), state.turn)
}

function is_castle_legal(state: BoardState, move: Move) {
    if (!coordinates_eq(move.from, state.turn === Color.White ? make_coordinates(5, 1) : make_coordinates(5, 8))) {
        return false
    }

    const rook_square: Coordinates = move.is_castling_kingside
        ? (state.turn === Color.White
            ? make_coordinates(8, 1)
            : make_coordinates(8, 8))
        : (state.turn === Color.White
            ? make_coordinates(1, 1)
            : make_coordinates(1, 8))
    
    const rook: BoardPiece | null = get_piece_by_square(rook_square, state)

    if (!is_piece(rook)) {
        return false
    }

    if (move.from.y !== move.to.y) {
        return false
    }

    function free_between_on_rank(from: number, to: number, rank: number): boolean {
        const direction = from < to ? 1 : -1
        
        while (direction === 1 ? from + direction < to : from + direction > to) {
            const pos = make_coordinates(from + direction, rank)
    
            if (square_has_piece(pos, state) || is_square_controlled_by(state, pos, other_color(state.turn))) {
                return false
            }
    
            from += direction
        }
    
        return true
    }
    
    if (!free_between_on_rank(move.from.x, move.is_castling_kingside ? rook_square.x : rook.square.x + 1, move.from.y)) {
        return false
    }

    if (move.is_castling_queenside && square_has_piece(make_coordinates(rook_square.x + 1, rook_square.y), state)) {
        return false
    }

    if (is_check(state, state.turn)) {
        return false
    }

    return true
}

/** Exclude moves which would put the player's own king in check and illegal castle moves */
export function get_legal_moves(state: BoardState): Moves {
    return get_prospective_moves(state).filter(
        (move: Move) => ! (move.is_castling_kingside || move.is_castling_queenside) ? ! is_self_check(state, move) : is_castle_legal(state, move)
    )
}

export function get_legal_moves_by_piece(state: BoardState, piece: BoardPiece): Moves {
    return get_piece_moves(piece, state).filter(
        (move: Move) => ! (move.is_castling_kingside || move.is_castling_queenside) ? ! is_self_check(state, move) : is_castle_legal(state, move)
    )
}

export function can_piece_move_to(state: BoardState, piece: BoardPiece, to: Coordinates): boolean {
    return get_legal_moves_by_piece(state, piece).map(
        (m: Move) => m.to
    ).some(
        (c: Coordinates) => coordinates_eq(c, to)
    )
}