export enum Piece { Pawn, Knight, Bishop, Rook, Queen, King }
export enum Color { White, Black }

export enum Result { "1-0", "1/2-1/2", "0-1" }

export type BoardPiece = { piece: Piece, color: Color, square: Coordinates }
export type CastlingRights = {
    white_kingside: boolean,
    white_queenside: boolean,
    black_kingside: boolean,
    black_queenside: boolean
}
export type BoardState = {
    pieces: BoardPiece[],
    en_passant_square: Coordinates | null,
    turn: Color
    castling: CastlingRights,
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
    is_capture: boolean,
    is_castling_kingside: boolean,
    is_castling_queenside: boolean,
    is_en_passant: boolean,
    promotion_piece?: Piece
}
export type Moves = Move[]
