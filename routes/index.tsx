import { Head } from "$fresh/runtime.ts";
import { ChessBoard } from "../components/ChessBoard.tsx";

export default function Home() {
    return (
        <>
        <Head>
            <title>PKD Chess Game</title>
        </Head>
        <div class="app-container">
            {/*
                <Counter start={3} />
            */}
            <div>
                <header>
                    PKD Chess
                </header>
            </div>
            <div>
                <ChessBoard board_fen={"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"} />
            </div>
            <div class="about">
                <img
                    src="/uppsala.svg"
                    height="60"
                    alt="logo of Uppsala"
                /> 
                <div>
                    This project was made as part of an assignment for the PKD course in <br /> 
                    Uppsala University. The source can be found here: <br />
                    <a href="https://github.com/Marre3/pkd-project">https://github.com/Marre3/pkd-project</a>
                </div>
            </div>
      </div>
    </>
  );
}
