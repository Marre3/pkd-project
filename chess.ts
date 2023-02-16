enum Piece { Pawn, Knight, Bishop, Rook, Queen, King };
enum Color { White, Black };

type BoardPiece = { piece: Piece, color: Color, square: Coordinates };
type BoardState = {
    pieces: BoardPiece[],
    en_passant_square: Coordinates | null,
    turn: Color
}
type Coordinates = { x: number, y: number };
type Move = { from: Coordinates, to: Coordinates, is_castling: boolean, is_en_passant: boolean }
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

function get_color_by_letter(letter: string): Color {
    return letter.toLowerCase() === letter ? Color.Black : Color.White
}

function position_from_fen(FEN: string): BoardState {
    let board: BoardState = {
        pieces: [],
        en_passant_square: null,
        turn: Color.White
    }
    let x = 1
    let y = 8
    let piece_placement = false
    let active_color = false
    for (const c of FEN) {
        if (!piece_placement) {
            if (c == "/") {
                --y
                x = 1
            } else if (c == " ") {
                piece_placement = true
            } else if (["P", "N", "B", "R", "Q", "K", "p", "n", "b", "r", "q", "k"].includes(c)) {
                board.pieces.push(
                    {piece: get_piece_by_letter(c), color: get_color_by_letter(c), square: make_coordinates(x, y)},
                )
                ++x
            } else if (["1", "2", "3", "4", "5", "6", "7", "8"].includes(c)) {
                x = x + parseInt(c)
            }
        } else if (!active_color) {
            if (c == "w") {
                board.turn = Color.White
            } else if (c == "b") {
                board.turn = Color.Black
            } else {
                active_color = true
            }
        }
    }
    return board
}

function get_default_board(): BoardState  {
    return position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
}

function make_coordinates(x: number, y: number): Coordinates {
    return { x, y };
}

function out_of_bounds(coordinates: Coordinates) {
    return coordinates.x < 1 || coordinates.x > 8 || coordinates.y < 1 || coordinates.y > 8;
}

function get_piece_by_square(coordinates: Coordinates, state: BoardState): BoardPiece | null {
    for (const piece of state.pieces) {
        if (piece.square.x == coordinates.x && piece.square.y == coordinates.y) {
            return piece
        }
    }
    return null
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
        let pos: Coordinates = {x: piece.square.x + direction[0], y: piece.square.y + direction[1]}
        while (!out_of_bounds(pos) && (!square_has_piece(pos, state, piece.color))) {
            moves.push({ from: piece.square, to: {x: pos.x, y: pos.y}, is_castling: false, is_en_passant: false })
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

function is_rook(piece: BoardPiece): boolean {
    return piece.piece == Piece.Rook
}

function is_bishop(piece: BoardPiece): boolean {
    return piece.piece == Piece.Rook
}

function is_queen(piece: BoardPiece): boolean {
    return piece.piece == Piece.Rook
}

function get_piece_moves(piece: BoardPiece, state: BoardState): Moves {
    return is_rook(piece)
        ? get_rook_moves(piece, state)
        : is_bishop(piece)
        ? get_bishop_moves(piece, state)
        : is_queen(piece)
        ? get_queen_moves(piece, state)
        : []

}

function get_player_pieces(state: BoardState, color: Color): BoardPiece[] {
    const pieces: BoardPiece[] = []
    for (const piece of state.pieces) {
        if (piece.color == color) {
            pieces.push(piece)
        }
    }
    return pieces
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
    for (const move of get_prospective_moves(state)) {
        if (move.to == get_king_position(state, color)) {
            return true
        }
    }
    return false
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
        pieces: state.pieces.filter(
            (p: BoardPiece) => (p.square != move.to && p.square != move.from),
        ).concat([new_piece]),
        en_passant_square: null,
        turn: other_color(state.turn)
    }
}

function get_legal_moves(state: BoardState): Moves {
    let moves: Moves = get_prospective_moves(state)
    moves = moves.filter(
        (move: Move) => ! is_check(apply_move(state, move), state.turn),
    )
    return moves
}

const board = get_default_board()
console.log(get_legal_moves(board))
console.log(get_legal_moves(board).length)
console.log(square_has_piece({x: 1, y:1}, board))

for (let y = 1; y <= 8; ++y) {
    let s = ""
    for (let x = 1; x <= 8; ++x) {
        const p = get_piece_by_square(make_coordinates(x, y), board)
        s = s + "  " + p?.piece + "  "
    }
    console.log(s)
}