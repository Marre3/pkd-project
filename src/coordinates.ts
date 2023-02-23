export type Coordinates = { x: number, y: number }

export function make_coordinates(x: number, y: number): Coordinates {
    return { x, y }
}

export function coordinates_eq(a: Coordinates, b: Coordinates) {
    return a.x === b.x && a.y === b.y
}

export function file_to_character(file: number): string {
    return String.fromCharCode(96 + file)
}

export function coordinates_to_notation(coordinates: Coordinates): string {
    return file_to_character(coordinates.x) + coordinates.y.toString()
}

export function coordinates_from_notation(notation: string): Coordinates {
    return make_coordinates(
        notation.charCodeAt(0) - 96,
        parseInt(notation[1])
    )
}
