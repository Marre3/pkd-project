import { BoardPiece, BoardState, Color } from '../chess.ts'

const UNICODE_WHITE_PIECES_START = 0x2653
const UNICODE_BLACK_PIECES_START = 0x2659

function ChessPiece({piece}: {piece: BoardPiece|undefined}) {
    if (piece === undefined) {
        return <div></div>
    }
    const unicode_pieces_start = piece.color === Color.White 
        ? UNICODE_WHITE_PIECES_START 
        : UNICODE_BLACK_PIECES_START
    const unicode_string = String.fromCodePoint(unicode_pieces_start + piece.piece)
    return <div class="piece">{unicode_string}</div>
}

export function ChessBoard({board}: {board: BoardState}) {
    const width = board.width
    const height = board.height

    const pieces = new Array<BoardPiece|undefined>(width * height)
    for(const piece of board.pieces) {
        // NOTE: Piece isn't zero indexed...
        pieces[(piece.square.x - 1) + (piece.square.y - 1) * width] = piece
    }

    return <div class="chess-board">
        {[...Array(height)].map((_, i) => <div class="row">
            {[...Array(width)].map((_, j) => <div class={((i+j) & 1) === 1 ? 'tile black' : 'tile'}>
                <ChessPiece piece={pieces[i * width + j]} />
            </div>)}
        </div>)}
    </div>
}
