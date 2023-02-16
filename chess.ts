enum Piece { Pawn, Knight, Bishop, Rook, Queen, King };
enum Color { White, Black };

type BoardPiece = { piece: Piece, color: Color, square: string };
type Board = Array<Array<BoardPiece | undefined>>;
type Player = { color: Color, pieces: Array<Array<BoardPiece>> };
type Game = { board: Board, white: Player, black: Player, moves: Array<Move>, turn: Color };
type Coordinates = { x: number, y: number };
type Move = { boardPiece: BoardPiece, from: Coordinates, to: Coordinates }

function setup_player_piece_arrays(player: Player): void {
	for (let i = 0; i < 6; i++) {
		player.pieces[i] = [];
	}
}

function setup_player_pieces(white: Player, black: Player, board: Board): void {
	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			const boardPiece = board_piece_at_coordinates(make_coordinates(x, y), board);

			if (boardPiece !== undefined) {
				const piece = boardPiece.piece;

				if (boardPiece.color === Color.White) {
					white.pieces[piece].push(boardPiece);
				} else {
					black.pieces[piece].push(boardPiece);
				}
			}
		}
	}
}

function get_default_board(): Board  {
	const board: Board = [];

	// Initial setup
	for (let x = 0; x < 8; x++) {
		board[x] = [];

		for (let y = 0; y < 8; y++) {
			board[x][y] = undefined;
		}
	}

	// White pieces
	board[0][0] = { piece: Piece.Rook, color: Color.White, square: "a1" };
	board[1][0] = { piece: Piece.Knight, color: Color.White, square: "b1" };
	board[2][0] = { piece: Piece.Bishop, color: Color.White, square: "c1" };
	board[3][0] = { piece: Piece.Queen, color: Color.White, square: "d1" };
	board[4][0] = { piece: Piece.King, color: Color.White, square: "e1" };
	board[5][0] = { piece: Piece.Bishop, color: Color.White, square: "f1" };
	board[6][0] = { piece: Piece.Knight, color: Color.White, square: "g1" };
	board[7][0] = { piece: Piece.Rook, color: Color.White, square: "h1" };

	// White pawns
	board[0][1] = { piece: Piece.Pawn, color: Color.White, square: "a2" };
	board[1][1] = { piece: Piece.Pawn, color: Color.White, square: "b2" };
	board[2][1] = { piece: Piece.Pawn, color: Color.White, square: "c2" };
	board[3][1] = { piece: Piece.Pawn, color: Color.White, square: "d2" };
	board[4][1] = { piece: Piece.Pawn, color: Color.White, square: "e2" };
	board[5][1] = { piece: Piece.Pawn, color: Color.White, square: "f2" };
	board[6][1] = { piece: Piece.Pawn, color: Color.White, square: "g2" };
	board[7][1] = { piece: Piece.Pawn, color: Color.White, square: "h2" };

	// Black pieces
	board[0][7] = { piece: Piece.Rook, color: Color.Black, square: "a8" };
	board[1][7] = { piece: Piece.Knight, color: Color.Black, square: "b8" };
	board[2][7] = { piece: Piece.Bishop, color: Color.Black, square: "c8" };
	board[3][7] = { piece: Piece.Queen, color: Color.Black, square: "d8" };
	board[4][7] = { piece: Piece.King, color: Color.Black, square: "e8" };
	board[5][7] = { piece: Piece.Bishop, color: Color.Black, square: "f8" };
	board[6][7] = { piece: Piece.Knight, color: Color.Black, square: "g8" };
	board[7][7] = { piece: Piece.Rook, color: Color.Black, square: "h8" };

	// Black pawns
	board[0][6] = { piece: Piece.Pawn, color: Color.Black, square: "a7" };
	board[1][6] = { piece: Piece.Pawn, color: Color.Black, square: "b7" };
	board[2][6] = { piece: Piece.Pawn, color: Color.Black, square: "c7" };
	board[3][6] = { piece: Piece.Pawn, color: Color.Black, square: "d7" };
	board[4][6] = { piece: Piece.Pawn, color: Color.Black, square: "e7" };
	board[5][6] = { piece: Piece.Pawn, color: Color.Black, square: "f7" };
	board[6][6] = { piece: Piece.Pawn, color: Color.Black, square: "g7" };
	board[7][6] = { piece: Piece.Pawn, color: Color.Black, square: "h7" };

	return board;
}

function create_new_game(): Game {
	const white: Player = { color: Color.White, pieces: [] }
	const black: Player = { color: Color.Black, pieces: [] }

	setup_player_piece_arrays(white);
	setup_player_piece_arrays(black);

	const board = get_default_board();

	setup_player_pieces(white, black, board);

	const game: Game = { board, white, black, moves: [], turn: Color.White };

	return game;
}

function make_coordinates(x: number, y: number): Coordinates {
	return { x, y };
}

function coordinates_to_square(coordinates: Coordinates): string {
	return String.fromCharCode(97 + coordinates.x) + (coordinates.y + 1).toString();
}

function square_to_coordinates(square: string): Coordinates {
	return { x: square.charCodeAt(0) - 97, y: Number(square[1]) - 1 };
}

function board_piece_at_square(square: string, board: Board): BoardPiece | undefined {
	return board[square.charCodeAt(0) - 97][Number(square[1]) - 1];
}

function board_piece_at_coordinates(coordinates: Coordinates, board: Board): BoardPiece | undefined {
	return board[coordinates.x][coordinates.y];
}

function board_piece_to_coordinates(boardPiece: BoardPiece): Coordinates {
	return square_to_coordinates(boardPiece.square);
}

function out_of_bounds(coordinates: Coordinates) {
	return coordinates.x < 0 || coordinates.x > 7 || coordinates.y < 0 || coordinates.y > 7;
}

function can_move_by_rules(boardPiece: BoardPiece, to: Coordinates, game: Game): boolean {
	function can_pawn(): boolean {
		if (boardPiece.color === Color.White) {
			// one step forward
			if (to.y - from.y === 1 && to.x - from.x === 0) return true;

			// two steps forward (only pawns on second rank)
			if (from.y === 1 && (to.y - from.y === 2 && to.x - from.x === 0)) return true;

			// en passant
			if (from.y === 4 && to.y - from.y === 1 && Math.abs(to.x - from.x) === 1) {
				let enemyBoardPiece: BoardPiece | undefined = board_piece_at_coordinates(make_coordinates(to.x, from.y), game.board);

				if (enemyBoardPiece === undefined || enemyBoardPiece.color === boardPiece.color 
					|| enemyBoardPiece.piece !== Piece.Pawn || game.moves.length === 0) return false;

					const lastMove: Move = game.moves[game.moves.length - 1];
				
				if (lastMove.boardPiece === enemyBoardPiece && lastMove.from.y === 6) return true;
			}
		} else {
			// one step forward
			if (from.y - to.y === 1 && to.x - from.x === 0) return true;

			// two steps forward (only pawns on seventh rank)
			if (from.y === 6 && (from.y - to.y === 2 && to.x - from.x === 0)) return true;

			// en passant
			if (from.y === 3 && from.y - to.y === 1 && Math.abs(to.x - from.x) === 1) {
				const enemyBoardPiece: BoardPiece | undefined = board_piece_at_coordinates(make_coordinates(to.x, from.y), game.board);

				if (enemyBoardPiece === undefined || enemyBoardPiece.color === boardPiece.color 
					|| enemyBoardPiece.piece !== Piece.Pawn || game.moves.length === 0) return false;

					const lastMove: Move = game.moves[game.moves.length - 1];
				
				if (lastMove.boardPiece === enemyBoardPiece && lastMove.from.y === 1) return true;
			}
		}

		return false;
	}

	function can_knight(): boolean {
		return ((Math.abs(to.x - from.x) === 2 && Math.abs(to.y - from.y) === 1)
			|| (Math.abs(to.x - from.x) === 1 && Math.abs(to.y - from.y) === 2));
	}

	function can_bishop(): boolean {
		return to.x - from.x !== 0 && Math.abs(to.x - from.x) === Math.abs(to.y - from.y);
	}

	function can_rook(): boolean {
		return ((to.x - from.x !== 0 && to.y - from.y === 0) || (to.x - from.x == 0 && to.y - from.y !== 0));
	}

	function can_queen(): boolean {
		return can_bishop() || can_rook();
	}

	function can_king(): boolean {
		const diff_x = Math.abs(to.x - from.x);
		const diff_y = Math.abs(to.y - from.y);

		if (diff_x === 0 && diff_y === 0) return false;

		// castle stuff

		return (diff_x <= 1 && diff_y <= 1);
	}

	const from = square_to_coordinates(boardPiece.square);

	if (out_of_bounds(from) || out_of_bounds(to)) return false;

	const piece = boardPiece.piece;

	return piece === Piece.Pawn
	? can_pawn()
	: piece === Piece.Knight
	? can_knight()
	: piece === Piece.Bishop
	? can_bishop()
	: piece === Piece.Rook
	? can_rook()
	: piece === Piece.Queen
	? can_queen()
	: can_king();
}

function can_actually_move(boardPiece: BoardPiece, to: Coordinates, game: Game) {
	if (boardPiece === undefined || game.turn !== boardPiece.color) return false;
	if (!can_move_by_rules(boardPiece, to, game)) return false;

	const board_piece_at_to: BoardPiece | undefined = board_piece_at_coordinates(make_coordinates(to.x, to.y), board);

	if (board_piece_at_to !== undefined && board_piece_at_to.color === boardPiece.color) return false;

	// not in check
	// free way between

	return true;
}

function move_board_piece_to_coordinates(boardPiece: BoardPiece, toCoordinates: Coordinates, game: Game): boolean {
	if (!can_actually_move(boardPiece, toCoordinates, game)) return false;

	const board: Board = game.board;
	const fromCoordinates: Coordinates = board_piece_to_coordinates(boardPiece);

	boardPiece.square = coordinates_to_square(make_coordinates(toCoordinates.x, toCoordinates.y));

	board[toCoordinates.x][toCoordinates.y] = boardPiece;
	board[fromCoordinates.x][fromCoordinates.y] = undefined;

	// if en passant also remove piece next to from

	game.moves[game.moves.length] = { boardPiece, from: fromCoordinates, to: toCoordinates };
	game.turn = boardPiece.color === Color.White ? Color.Black : Color.White;

	return true;
}

function board_piece_to_char(boardPiece: BoardPiece | undefined): string {
	if (boardPiece === undefined) return "E";

	const piece = boardPiece.piece;

	return piece === Piece.Pawn
	? "P"
	: piece === Piece.Knight
	? "N"
	: piece === Piece.Bishop
	? "B"
	: piece === Piece.Rook
	? "R"
	: piece === Piece.Queen
	? "Q"
	: piece === Piece.King
	? "K"
	: "";
}

function draw(board: Board): void {
	for (let y = 7; y >= 0; y--) {
		let rank = "";

		for (let x = 0; x <= 7; x++) {
			const boardPiece: BoardPiece | undefined = board_piece_at_coordinates(make_coordinates(x, y), board);

			if (boardPiece !== undefined && boardPiece.color === Color.White) {
				rank += '\x1B[37m';
			} else if (boardPiece !== undefined && boardPiece.color === Color.Black) {
				rank += '\x1B[36m';
			} else {
				rank += '\x1B[32m';
			}

			rank += board_piece_to_char(board_piece_at_coordinates(make_coordinates(x, y), board)) + " ";
		}

		console.log(rank + '\x1B[37m');
	}
}

const game: Game = create_new_game();
const board: Board = game.board;
const white: Player = game.white;
const black: Player = game.black;

draw(board);

for (let i = 0; i < white.pieces[Piece.Pawn].length; i++) {
	console.log(white.pieces[Piece.Pawn][i]);
}

move_board_piece_to_coordinates(board_piece_at_square("e2", board) as BoardPiece, square_to_coordinates("e4"), game);
move_board_piece_to_coordinates(board_piece_at_square("e7", board) as BoardPiece, square_to_coordinates("e6"), game);
move_board_piece_to_coordinates(board_piece_at_square("e4", board) as BoardPiece, square_to_coordinates("e5"), game);
move_board_piece_to_coordinates(board_piece_at_square("f7", board) as BoardPiece, square_to_coordinates("f5"), game);

draw(board);

for (let i = 0; i < white.pieces[Piece.Pawn].length; i++) {
	console.log(white.pieces[Piece.Pawn][i]);
}

//en passant
console.log(can_move_by_rules(board_piece_at_square("e5", board) as BoardPiece, square_to_coordinates("f6"), game));


console.log(can_move_by_rules(board_piece_at_square("d1", board) as BoardPiece, square_to_coordinates("d3"), game));
console.log(can_move_by_rules(board_piece_at_square("d2", board) as BoardPiece, square_to_coordinates("d5"), game));