import { test, expect } from '@jest/globals'
import { get_default_board, get_king_position, Color, Piece } from 'everything'

test('get_king_position_basic', () => {
    const board = get_default_board()
    const black_king = get_king_position(board, Color.Black)
    expect(black_king.x).toBe(5)
    expect(black_king.y).toBe(8)
    const white_king = get_king_position(board, Color.White)
    expect(white_king.x).toBe(5)
    expect(white_king.y).toBe(1)
})

test('no_kings_on_board', () => {
    const board = get_default_board()
    board.pieces = board.pieces.filter((piece) => piece.piece !== Piece.King)
    expect(() => get_king_position(board, Color.White)).toThrow()
    expect(() => get_king_position(board, Color.Black)).toThrow()
})
