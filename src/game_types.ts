export enum Piece { Pawn, Knight, Bishop, Rook, Queen, King }
export enum Color { White, Black }

export type BoardPiece = { piece: Piece, color: Color, square: Coordinates }

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
export type Coordinates = { x: number, y: number }
export type Move = {
    from: Coordinates,
    to: Coordinates,
    piece_type: Piece,
    is_castling: boolean,
    is_en_passant: boolean
}
export type Moves = Move[]
