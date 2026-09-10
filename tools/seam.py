"""Reports where a colour block starts and ends in a screenshot, column by column.

Used to check that a band's CSS block and the plate drawn on top of it break at
the same row, which is the only way to see a one-pixel seam at the canvas edge.

Usage: python tools/seam.py <png> <x> [<x> ...]
"""

from __future__ import annotations

import sys

from PIL import Image


def main() -> None:
    path = sys.argv[1]
    columns = [int(value) for value in sys.argv[2:]] or [100, 960, 1800]
    image = Image.open(path).convert("RGB")
    pixels = image.load()
    width, height = image.size

    def is_white(pixel: tuple[int, int, int]) -> bool:
        return min(pixel) > 240

    for x in columns:
        if x >= width:
            continue
        rows = [y for y in range(height) if not is_white(pixels[x, y])]
        if not rows:
            print(f"x={x:5} all white")
            continue
        print(f"x={x:5} ink {rows[0]}..{rows[-1]}  colour {pixels[x, rows[len(rows) // 2]]}")


if __name__ == "__main__":
    main()
