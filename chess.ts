enum Piece { Pawn = 6, Knight = 5, Bishop = 4, Rook = 3, Queen = 2, King = 1 };
export enum Color { White, Black };

export type BoardPiece = { piece: Piece, color: Color, square: Coordinates };
export type BoardState = {
    pieces: BoardPiece[],
    en_passant_square: Coordinates | null,
    turn: Color
    
    // Hardcoded right now to literal. But the flexibility is a bonus.
    width: 8; 
    height: 8;
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

export function position_from_fen(FEN: string): BoardState {
    const board: BoardState = {
        width: 8,
        height: 8,
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

export function get_default_board(): BoardState  {
    return position_from_fen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    // Kept in case anyone wanted it...
    /*return {
        width: 8,
        height: 8,
        pieces: [
            {piece: Piece.Rook, color: Color.White, square: make_coordinates(1, 1)},
            {piece: Piece.Rook, color: Color.White, square: make_coordinates(8, 1)},
            {piece: Piece.Rook, color: Color.Black, square: make_coordinates(1, 8)},
            {piece: Piece.Rook, color: Color.Black, square: make_coordinates(8, 8)}
        ],
        en_passant_square: null,
        turn: Color.White
    }*/
}

function make_coordinates(x: number, y: number): Coordinates {
    return { x, y };
}

function out_of_bounds(state: BoardState, coordinates: Coordinates) {
    return coordinates.x < 1 || coordinates.x > state.width || coordinates.y < 1 || coordinates.y > state.height;
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
        const pos: Coordinates = {x: piece.square.x + direction[0], y: piece.square.y + direction[1]}
        while (!out_of_bounds(state, pos) && (!square_has_piece(pos, state, piece.color))) {
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

function get_legal_moves(state: BoardState): Moves {
    const moves: Moves = []

    return moves
}

// const board = get_default_board()
// console.log(get_prospective_moves(board))
// console.log(get_prospective_moves(board).length)
// console.log(square_has_piece({x: 1, y:1}, board))
const board = position_from_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
console.log(board)
console.log(get_prospective_moves(board))
console.log(get_prospective_moves(board).length)

// for (const p of board.pieces) {
//     console.log(p.square)
// }

for (let y = 1; y <= 8; ++y) {
    let s = ""
    for (let x = 1; x <= 8; ++x) {
        const p = get_piece_by_square(make_coordinates(x, y), board)
        s = s + "  " + p?.piece + "  "
    }
    console.log(s)
}
