enum Piece { Pawn, Knight, Bishop, Rook, Queen, King }
enum Color { White, Black }

type BoardPiece = { piece: Piece, color: Color, square: Coordinates }

export type BoardState = {
    pieces: BoardPiece[],
    en_passant_square: Coordinates | null,
    turn: Color
    castling: {
        white_kingside: boolean,
        white_queenside: boolean,
        black_kingside: boolean,
        black_queenside: boolean
    }
    halfmove_clock: number,
    fullmove_number: number,
    // Hardcoded right now to literal. But the flexibility is a bonus.
    width: 8;
    height: 8;
}
type Coordinates = { x: number, y: number }
type Move = {
    from: Coordinates,
    to: Coordinates,
    piece_type: Piece,
    is_castling: boolean,
    is_en_passant: boolean
}
type Moves = Move[]

function get_piece_by_letter(letter: string): Piece {
    letter = letter.toLowerCase()
    return letter === "p"
        ? Piece.Pawn
        : letter === "n"
        ? Piece.Knight
        : letter === "b"
        ? Piece.Bishop
        : letter === "r"
        ? Piece.Rook
        : letter === "q"
        ? Piece.Queen
        : Piece.King
}

function get_letter_by_piece(boardPiece: BoardPiece | null): string {
    if (!is_piece(boardPiece)) return "E"

    const piece = boardPiece.piece
    return get_letter_by_color(
        piece === Piece.Pawn
        ? "P"
        : piece === Piece.Knight
        ? "N"
        : piece === Piece.Bishop
        ? "B"
        : piece === Piece.Rook
        ? "R"
        : piece === Piece.Queen
        ? "Q"
        : "K",
        boardPiece.color
    )
}

function get_color_by_letter(letter: string): Color {
    return letter.toLowerCase() === letter ? Color.Black : Color.White
}

function get_letter_by_color(letter: string, color: Color): string {
    return color === Color.White ? letter.toUpperCase() : letter.toLowerCase()
}

export function position_from_fen(FEN: string): BoardState {
    function get_pieces(piece_data: string): BoardPiece[] {
        let y = 8
        const pieces: BoardPiece[] = []
        for (const row of piece_data.split("/")) {
            let x = 1
            for (const c of row) {
                if (isNaN(parseInt(c))) {
                    pieces.push(
                        {
                            piece: get_piece_by_letter(c),
                            color: get_color_by_letter(c),
                            square: make_coordinates(x, y)
                        },
                    )
                    ++x
                } else {
                    x = x + parseInt(c)
                }
            }
            --y
        }
        return pieces
    }
    const parts = FEN.split(" ")
    return {
        width: 8,
        height: 8,
        pieces: get_pieces(parts[0]),
        castling: {
            white_kingside: parts[2].includes("K"),
            white_queenside: parts[2].includes("Q"),
            black_kingside: parts[2].includes("k"),
            black_queenside: parts[2].includes("q")
        },
        halfmove_clock: parseInt(parts[4]),
        fullmove_number: parseInt(parts[5]),
        en_passant_square: parts[3] === "-" ? null : coordinates_from_notation(parts[3]),
        turn: parts[1] === "w" ? Color.White : Color.Black
    }
}

export function coordinates_to_notation(coordinates: Coordinates): string {
    return String.fromCharCode(96 + coordinates.x) + coordinates.y.toString()
}

export function coordinates_from_notation(notation: string): Coordinates {
    return make_coordinates(
        notation.charCodeAt(0) - 96,
        parseInt(notation[1])
    )
}

export function export_to_fen(state: BoardState): string {
    function row_to_fen(y: number): string {
        return [1, 2, 3, 4, 5, 6, 7, 8].map(
            (x) => get_letter_by_piece(
                get_piece_by_square(make_coordinates(x, y), state)
            )
        ).map(
            (c) => c === "E" ? "1" : c
        ).reduce(
            (l, r) => (
                ["1", "2", "3", "4", "5", "6", "7"].includes(l.slice(-1))
                && r === "1"
            ) ? l.slice(0, -1) + (parseInt(l.slice(-1)) + 1).toString() : l + r
        )
    }
    function get_castling_rights_string(state: BoardState): string {
        return (
            (state.castling.white_kingside ? "K" : "")
            + (state.castling.white_queenside ? "Q" : "")
            + (state.castling.black_kingside ? "k" : "")
            + (state.castling.black_queenside ? "q" : "")
        ) || "-"
    }
    function get_en_passant_string(state: BoardState): string {
        return state.en_passant_square === null
            ? "-"
            : coordinates_to_notation(state.en_passant_square)

    }
    return (
        [8, 7, 6, 5, 4, 3, 2, 1].map(row_to_fen).join("/")
        + " "
        + (state.turn === Color.White ? "w" : "b")
        + " "
        + get_castling_rights_string(state)
        + " "
        + get_en_passant_string(state)
        + " "
        + state.halfmove_clock.toString()
        + " "
        + state.fullmove_number.toString()
    )
}

export function get_default_board(): BoardState  {
    return position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
}

export function make_coordinates(x: number, y: number): Coordinates {
    return { x, y }
}

function out_of_bounds(state: BoardState, coordinates: Coordinates) {
    return coordinates.x < 1 || coordinates.x > state.width || coordinates.y < 1 || coordinates.y > state.height
}

function get_piece_by_square(coordinates: Coordinates, state: BoardState): BoardPiece | null {
    return state.pieces.find(
        (piece) => piece.square.x == coordinates.x && piece.square.y == coordinates.y
    ) || null
}

function is_piece(piece: BoardPiece | null): piece is BoardPiece {
    return piece != null
}

function square_has_piece(coordinates: Coordinates, state: BoardState, color?: Color): boolean {
    const square_piece = get_piece_by_square(coordinates, state)
    return is_piece(square_piece) && (typeof color === "undefined" || square_piece.color == color)

}

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
                    is_castling: false,
                    is_en_passant: false
                }
            )
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
        const square = make_coordinates(piece.square.x + offset[0], piece.square.y + offset[1])
        if (! out_of_bounds(state, square) && ! square_has_piece(square, state, piece.color)) {
            moves.push(
                {
                    from: piece.square,
                    to: square,
                    piece_type: piece.piece,
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
        [[1, 1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
    )
}

function get_pawn_moves(piece: BoardPiece, state: BoardState): Moves {
    // TODO: google en passant
    // TODO: piece promotion
    const moves: Moves = []
    const one_square_ahead = make_coordinates(
        piece.square.x,
        piece.color === Color.White ? piece.square.y + 1 : piece.square.y - 1
    )
    const two_squares_ahead = make_coordinates(
        piece.square.x,
        piece.color === Color.White ? piece.square.y + 2 : piece.square.y - 2
    )
    if (! square_has_piece(one_square_ahead, state)) {
        moves.push(
            {
                from: piece.square,
                to: one_square_ahead,
                piece_type: piece.piece,
                is_castling: false,
                is_en_passant: false
            }
        )

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
                    is_castling: false,
                    is_en_passant: false
                }
            )
        }
    }
    return moves
}

function is_rook(piece: BoardPiece): boolean {
    return piece.piece == Piece.Rook
}

function is_bishop(piece: BoardPiece): boolean {
    return piece.piece == Piece.Bishop
}

function is_queen(piece: BoardPiece): boolean {
    return piece.piece == Piece.Queen
}

function is_knight(piece: BoardPiece): boolean {
    return piece.piece == Piece.Knight
}

function is_king(piece: BoardPiece): boolean {
    return piece.piece == Piece.King
}

function is_pawn(piece: BoardPiece): boolean {
    return piece.piece == Piece.Pawn
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

function get_player_pieces(state: BoardState, color: Color): BoardPiece[] {
    return state.pieces.filter((piece) => piece.color === color)
}

function get_prospective_moves(state: BoardState): Moves {
    let moves: Moves = []
    for (const piece of get_player_pieces(state, state.turn)) {
        moves = moves.concat(get_piece_moves(piece, state))
    }
    return moves
}

function get_king_position(state: BoardState, color: Color): Coordinates {
    for (const piece of state.pieces) {
        if (piece.piece == Piece.King && piece.color == color) {
            return piece.square
        }
    }
    throw new Error(`Invalid board position, no king found! State: ${state}, color: ${color}`)
}

function is_check(state: BoardState, color: Color): boolean {
    return get_prospective_moves(state).some((move) => (move.to == get_king_position(state, color)))
}

function other_color(color: Color): Color {
    return color == Color.Black ? Color.White : Color.Black
}

function apply_move(state: BoardState, move: Move): BoardState {
    const old_piece = get_piece_by_square(move.from, state)
    if (old_piece == null) {
        throw new Error(`Invalid move ${move}, origin piece does not exist`)
    }
    const new_piece = {
        piece: old_piece.piece,
        color: old_piece.color,
        square: move.to
    }
    return {
        // TODO: handle en passant and castling rights
        pieces: state.pieces.filter(
            (p: BoardPiece) => (p.square != move.to && p.square != move.from),
        ).concat([new_piece]),
        en_passant_square: null,
        turn: other_color(state.turn),
        castling: state.castling,
        halfmove_clock: state.halfmove_clock + 1, // TODO: Reset on pawn move or capture
        fullmove_number: state.fullmove_number + (state.turn === Color.Black ? 1 : 0),
        width: 8,
        height: 8,
    }
}

/** Exclude moves which would put the player's own king in check */
export function get_legal_moves(state: BoardState): Moves {
    return get_prospective_moves(state).filter(
        (move: Move) => ! is_check(apply_move(state, move), state.turn),
    )
}

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
