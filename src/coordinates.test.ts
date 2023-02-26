import { test, expect } from '@jest/globals'
import { file_to_character, make_coordinates, coordinates_to_notation, coordinates_from_notation } from 'everything'

test('make_coordinates', () => {
    for (let x = 1; x <= 8; ++x) {
        for (let y = 1; y <= 8; ++y) {
            const coordinates = make_coordinates(x, y)
            expect(coordinates.x).toBe(x)
            expect(coordinates.y).toBe(y)
        }
    }
})

test('file_to_character', () => {
    expect(file_to_character(1)).toBe("a")
    expect(file_to_character(2)).toBe("b")
    expect(file_to_character(3)).toBe("c")
    expect(file_to_character(4)).toBe("d")
    expect(file_to_character(5)).toBe("e")
    expect(file_to_character(6)).toBe("f")
    expect(file_to_character(7)).toBe("g")
    expect(file_to_character(8)).toBe("h")
})

test("test_coordinates_to_notation", () => {
    expect(coordinates_to_notation(make_coordinates(1, 1))).toBe("a1")
    expect(coordinates_to_notation(make_coordinates(1, 8))).toBe("a8")
    expect(coordinates_to_notation(make_coordinates(8, 8))).toBe("h8")
    expect(coordinates_to_notation(make_coordinates(8, 1))).toBe("h1")
    expect(coordinates_to_notation(make_coordinates(3, 4))).toBe("c4")
    expect(coordinates_to_notation(make_coordinates(2, 7))).toBe("b7")
    expect(coordinates_to_notation(make_coordinates(4, 4))).toBe("d4")
    expect(coordinates_to_notation(make_coordinates(5, 2))).toBe("e2")
    expect(coordinates_to_notation(make_coordinates(6, 5))).toBe("f5")
    expect(coordinates_to_notation(make_coordinates(7, 3))).toBe("g3")
})

test("test_coordinates_from_notation", () => {
    for (let x = 1; x <= 8; ++x) {
        for (let y = 1; y <= 8; ++y) {
            expect(make_coordinates(x, y))
                .toEqual(coordinates_from_notation(
                    coordinates_to_notation(make_coordinates(x, y))
                ))
        }
    }
})
