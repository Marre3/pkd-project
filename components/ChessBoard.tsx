import { IS_BROWSER } from "$fresh/runtime.ts";

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
            throw new Error("garbage in the FEN string")
        }
    }
    throw new Error("invalid FEN")
}

function file_to_character(file: number): string {
    // Adapted from src/coordinates.ts
    return String.fromCharCode(97 + file)
}
function coordinates_to_notation(file: number, rank: number): string {
    return `${file_to_character(file)}${8-rank}`
}

function dropHandler(i: number, j: number, move_cb: (from: string, to: string) => void) {
    return (event: DragEvent) => {
        event.preventDefault()
        const from = event.dataTransfer!.getData("text")
        move_cb(from, coordinates_to_notation(j, i))
    }
}

function dragHandler(event: DragEvent) {
    if (event.target instanceof HTMLDivElement) {
        // We do this in a separate handler or else the browser thinks that
        // the dragged element should be displayed as hidden.
        event.target.classList.add('hidden')
    }
}

function dragEndHandler(timers: number[]) {
    return (event: DragEvent) => {
        if (event.target instanceof HTMLDivElement) {
            const div = event.target
            timers.push(setTimeout(() => {
                div.classList.remove('hidden')
            }, 1))
        }
    }
}

function dragStartHandler(i: number, j: number) {
    return (event: DragEvent) => {
        // Where did the piece come from:
        event.dataTransfer!.setData("text", coordinates_to_notation(j, i))
    }
}

function allowDrop(event: DragEvent) {
    event.preventDefault();
}

interface ChessBoardProps {
    board_fen: string,
    timers: number[],
    move_cb: (from: string, to: string) => void,
}

export default function ChessBoard({board_fen, move_cb, timers}: ChessBoardProps) {
    for (const timer of timers) {
        clearTimeout(timer)
    }
    timers.length = 0
    const width = 8
    const height = 8
    const board = parse_fen(board_fen, width, height)
    console.log(board)

    return <div class="chess-board">
        {[...Array(height)].map((_, i) => <div class="row">
            {[...Array(width)].map((_, j) => <div onDrop={dropHandler(i, j, move_cb)}
                                                  onDragOver={allowDrop}
                                                  class={((i+j) & 1) === 1 ? "tile black" : "tile"}>
                <div class="piece"
                     draggable={IS_BROWSER}
                     onDrag={dragHandler}
                     onDragEnd={dragEndHandler(timers)}
                     onDragStart={dragStartHandler(i, j)}>
                    {board[i * width + j].unicode}
                </div>
            </div>)}
        </div>)}
    </div>
}
