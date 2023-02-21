import { useState } from "preact/hooks";
import ChessBoard from "../components/ChessBoard.tsx";
import { DEFAULT_BOARD_FEN, next_fen_by_move } from '../src/lib.ts'
export default function ChessGame() {
    const [board_fen, setBoardFEN] = useState(DEFAULT_BOARD_FEN)
    const [timers] = useState([])
    function move_cb(a: string, b: string) {
        console.log(a, "moves to", b)
        console.log(board_fen)
        setBoardFEN(next_fen_by_move(board_fen, a, b))
    }
    return <div>
        <ChessBoard timers={timers}
                    move_cb={move_cb}
                    board_fen={board_fen} />
    </div>
}
