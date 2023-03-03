import { Head } from "$fresh/runtime.ts";
import ChessGame from '../islands/ChessGame.tsx'

export default function Home() {
    return (<>
        <Head>
            <title>PKD Chess Game</title>
        </Head>
        <div class="app-container">
            <div>
                <header>
                    PKD Chess
                </header>
            </div>
            <ChessGame />
            <div class="about">
                <img
                    src="/uppsala.svg"
                    height="60"
                    alt="logo of Uppsala"
                />
                <div>
                    This project was made as part of an
                    assignment for the PKD course at <br />
                    Uppsala University. The source can be found here: <br />
                    <a href="https://github.com/Marre3/pkd-project">
                        https://github.com/Marre3/pkd-project
                    </a>
                </div>
            </div>
        </div>
    </>);
}
