import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { coordinates_from_notation, coordinates_to_notation, file_to_character, make_coordinates } from "./coordinates.ts";

Deno.test("test_make_coordinates", () => {
    for (let x = 1; x <= 8; ++x) {
        for (let y = 1; y <= 8; ++y) {
            const coordinates = make_coordinates(x, y)
            assertEquals(coordinates.x, x)
            assertEquals(coordinates.y, y)
        }
    }
})

Deno.test("test_file_to_character", () => {
    assertEquals(file_to_character(1), "a")
    assertEquals(file_to_character(2), "b")
    assertEquals(file_to_character(3), "c")
    assertEquals(file_to_character(4), "d")
    assertEquals(file_to_character(5), "e")
    assertEquals(file_to_character(6), "f")
    assertEquals(file_to_character(7), "g")
    assertEquals(file_to_character(8), "h")
})

Deno.test("test_coordinates_to_notation", () => {
    assertEquals(coordinates_to_notation(make_coordinates(1, 1)), "a1")
    assertEquals(coordinates_to_notation(make_coordinates(1, 8)), "a8")
    assertEquals(coordinates_to_notation(make_coordinates(8, 8)), "h8")
    assertEquals(coordinates_to_notation(make_coordinates(8, 1)), "h1")
    assertEquals(coordinates_to_notation(make_coordinates(3, 4)), "c4")
    assertEquals(coordinates_to_notation(make_coordinates(2, 7)), "b7")
    assertEquals(coordinates_to_notation(make_coordinates(4, 4)), "d4")
    assertEquals(coordinates_to_notation(make_coordinates(5, 2)), "e2")
    assertEquals(coordinates_to_notation(make_coordinates(6, 5)), "f5")
    assertEquals(coordinates_to_notation(make_coordinates(7, 3)), "g3")
})

Deno.test("test_coordinates_from_notation", () => {
    for (let x = 1; x <= 8; ++x) {
        for (let y = 1; y <= 8; ++y) {
            assertEquals(
                make_coordinates(x, y),
                coordinates_from_notation(
                    coordinates_to_notation(make_coordinates(x, y))
                )
            )
        }
    }
})
