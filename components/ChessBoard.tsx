interface Piece {
    unicode: string,
}

const UNICODE_WHITE_PIECES_START = 0x2654
const UNICODE_BLACK_PIECES_START = 0x265A
function make_piece(black: boolean, unicode_offset: number): Piece {
    const start = black
        ? UNICODE_BLACK_PIECES_START
        : UNICODE_WHITE_PIECES_START
    return {
        unicode: String.fromCodePoint(start + unicode_offset)
    }
}

const pieces = new Map([
    ["k", make_piece(true, 0)],
    ["q", make_piece(true, 1)],
    ["r", make_piece(true, 2)],
    ["b", make_piece(true, 3)],
    ["n", make_piece(true, 4)],
    ["p", make_piece(true, 5)],
    ["K", make_piece(false, 0)],
    ["Q", make_piece(false, 1)],
    ["R", make_piece(false, 2)],
    ["B", make_piece(false, 3)],
    ["N", make_piece(false, 4)],
    ["P", make_piece(false, 5)],
])

const empty_piece: Piece = {
    unicode: ''
}

function parse_fen(fen: string, width: number, height: number): Array<Piece> {
    const board = new Array(width * height).fill(empty_piece)
    let x = 0
    let y = 0
    for (const c of fen) {
        if (c == " ") {
            return board
        }
        if (c == "/") {
            ++y
            x = 0
            continue
        }
        const piece = pieces.get(c)
        if (piece !== undefined) {
            board[x + y * width] = piece
            ++x
        } else if ("12345678".includes(c)) {
            x = x + parseInt(c)
        } else {
            throw new Error('garbage in the FEN string')
        }
    }
    throw new Error('invalid FEN')
}

export function ChessBoard({board_fen}: {board_fen: string}) {
    const width = 8
    const height = 8
    const board = parse_fen(board_fen, width, height)
    console.log(board)

    return <div class="chess-board">
        {[...Array(height)].map((_, i) => <div class="row">
            {[...Array(width)].map((_, j) => <div class={((i+j) & 1) === 1 ? 'tile black' : 'tile'}>
                <div class="piece">{board[i * width + j].unicode}</div>
            </div>)}
        </div>)}
    </div>
}
