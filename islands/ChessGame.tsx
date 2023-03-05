import { useState } from "preact/hooks";
import ChessBoard from "../components/ChessBoard.tsx";
import { DEFAULT_BOARD_FEN, next_fen_by_move, next_fen_by_ai } from '../src/lib.ts'
export default function ChessGame() {
    const [game_mode, set_game_mode] = useState('')
    const [board_state, set_board_state] = useState({
        fen: DEFAULT_BOARD_FEN,
        starting_fen: DEFAULT_BOARD_FEN,
        played_moves: [],
        occured_positions: new Map(),
        checkmate: false,
        stalemate: false,

        from: '',
        to: '',
        promotion_piece: ''
    })
    const [timers] = useState([])

    function do_ai_move(state: FrontendState) {
        if (state.played_moves.length % 2 == 0) {
            // Not the AIs turn yet.
            return
        }
        setTimeout(() => {
            const ai_state = next_fen_by_ai(state)

            // Fake think for a short while.
            setTimeout(() => {
                set_board_state(ai_state)
            }, 1500)
        }, 100)
    }

    function move_cb(a: string, b: string) {
        console.log(a, "moves to", b)
        console.log(board_state)
        const next = next_fen_by_move({
            ...board_state,
            from: a,
            to: b,
        })
        set_board_state(next)

        if (game_mode === 'ai') {
            do_ai_move(next)
        }
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
        { game_mode === ''
         ? (<div class="over-board game-select">
            <div>My opponent is</div>
            <div class="game-mode" role="button" onClick={() => set_game_mode('ai')}>AI</div>
            <div>OR</div>
            <div class="game-mode" role="button" onClick={() => set_game_mode('human')}>human</div>
         </div>
         ): board_state.checkmate
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
