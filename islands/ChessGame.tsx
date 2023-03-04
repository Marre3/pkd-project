import { useState } from "preact/hooks";
import ChessBoard from "../components/ChessBoard.tsx";
import { DEFAULT_BOARD_FEN, next_fen_by_move } from '../src/lib.ts'
export default function ChessGame() {
    const [board_state, set_board_state] = useState({
        fen: DEFAULT_BOARD_FEN,
        checkmate: false,
        stalemate: false,
        from: '',
        to: '',
        promotion_piece: ''
    })
    const [timers] = useState([])
    function move_cb(a: string, b: string) {
        console.log(a, "moves to", b)
        console.log(board_state)
        set_board_state(next_fen_by_move({
            ...board_state,
            from: a,
            to: b,
        }))
    }
    function handle_promotion(promotion_piece: string) {
        return () => {
            set_board_state(next_fen_by_move({
                ...board_state,
                promotion_piece
            }))
        }
    }
    return <div class="chess-board-container">
        <ChessBoard timers={timers}
                    move_cb={move_cb}
                    board_fen={board_state.fen} />
        {board_state.checkmate
         ? <div class="over-board game-over">Checkmate!</div>
         : board_state.stalemate
         ? <div class="over-board game-over">Stalemate!</div>
         : board_state.promotion_piece === 'needed'
         ? <div class="over-board promotion">
            <div role="button" onClick={handle_promotion('N')}>&#x265E;</div>
            <div role="button" onClick={handle_promotion('B')}>&#x265D;</div>
            <div role="button" onClick={handle_promotion('R')}>&#x265C;</div>
            <div role="button" onClick={handle_promotion('Q')}>&#x265B;</div>
         </div>
         : <></>}
    </div>
}
