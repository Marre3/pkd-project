export type Coordinates = { x: number, y: number }

/**
 * Construct a Coordinates record from x- and y coordinates
 * @param x - the x coordinate
 * @param y - the y coordinate
 * @returns the constructed Coordinates record
 */
export function make_coordinates(x: number, y: number): Coordinates {
    return { x, y }
}

/**
 * Check if two Coordinates records have the same x- and y coordinates
 * @param a - the first Coordinates record
 * @param b - the second Coordinates record
 * @returns true if they have the same coordinates, false otherwise
 */
export function coordinates_eq(a: Coordinates, b: Coordinates) {
    return a.x === b.x && a.y === b.y
}

/**
 * Convert a number representing a file on a chessboard to the character representing that file
 * @example
 *  // returns 'h'
 * file_to_character(8);
 * @param file - the number representing a file
 * @precondition file is between (inclusive) 1 and 8
 * @returns the character representing the file
 */
export function file_to_character(file: number): string {
    return String.fromCharCode(96 + file)
}

/**
 * Convert coordinates representing a square on a chessboard to its square notation
 * @example
 *  // returns 'd5'
 * coordinates_to_notation({ x: 4, y: 5 });
 * @param coordinates - the coordinates representing a square on a chessboard
 * @precondition the x- and y fields of coordinates are between (inclusive) 1 and 8
 * @returns the square notation of the square represented by coordinates
 */
export function coordinates_to_notation(coordinates: Coordinates): string {
    return file_to_character(coordinates.x) + coordinates.y.toString()
}

/**
 * Convert square notation to coordinates representing the square
 * @example
 *  // returns { x: 4, y: 5 }
 * coordinates_from_notation("d5");
 * @param notation - the square notation
 * @precondition notation is two characters long and the first character is between (inclusive) a and h,
 * and the second character is between (inclusive) 1 and 8
 * @returns the coordinates representing the square
 */
export function coordinates_from_notation(notation: string): Coordinates {
    return make_coordinates(
        notation.charCodeAt(0) - 96,
        parseInt(notation[1])
    )
}
