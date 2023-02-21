import { useState } from "preact/hooks";
import ChessBoard from "../components/ChessBoard.tsx";
import { next_fen_by_move } from '../src/lib.ts'
export default function ChessGame() {
    const [board_fen, setBoardFEN] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    function move_cb(a: string, b: string) {
        console.log(a, "moves to", b)
        console.log(board_fen)
        setBoardFEN(next_fen_by_move(board_fen, a, b))
    }
    return <div>
        <ChessBoard move_cb={move_cb} board_fen={board_fen} />
    </div>
}
