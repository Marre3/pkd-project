import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { coordinates_from_notation, coordinates_to_notation, make_coordinates } from "./coordinates.ts";


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
