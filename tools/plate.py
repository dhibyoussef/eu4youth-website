"""Locate the artwork on a flattened band plate, in design px.

Some bands were built by laying live text over a picture of the whole band. Replacing that
picture with real elements needs to know where each piece of artwork sits on it — the lockup,
the icon strip, the logo row — so the live version lands exactly where the flattened one drew
it and the band does not shift. The plate's own blue is the background; anything far enough
from it is ink.

Usage: python tools/plate.py IMAGE Y0 Y1 [GAP]
       y range in design px (the plate is treated as 1920 wide)
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    name, y0, y1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
    gap = float(sys.argv[4]) if len(sys.argv) > 4 else 24.0

    img = Image.open(ROOT / 'public' / 'img' / name).convert('RGB')
    scale = img.width / 1920
    print(f'{name}  {img.width}x{img.height}  = {1920}x{round(img.height / scale)} design px\n')

    top, bottom = round(y0 * scale), round(y1 * scale)
    crop = img.crop((0, top, img.width, bottom))
    px = crop.load()

    # The band's own colour, sampled where nothing is drawn.
    base = px[2, crop.height // 2]

    def ink(x: int, y: int) -> bool:
        c = px[x, y]
        return sum(abs(a - b) for a, b in zip(c, base)) > 90

    # One bounding box per column that holds ink, then merge columns into marks.
    columns: list[tuple[int, int, int]] = []
    for x in range(crop.width):
        ys = [y for y in range(crop.height) if ink(x, y)]
        if ys:
            columns.append((x, min(ys), max(ys)))

    marks: list[list[int]] = []
    for x, cy0, cy1 in columns:
        if marks and x - marks[-1][1] <= gap * scale:
            marks[-1][1] = x
            marks[-1][2] = min(marks[-1][2], cy0)
            marks[-1][3] = max(marks[-1][3], cy1)
        else:
            marks.append([x, x, cy0, cy1])

    print(f'base #{base[0]:02x}{base[1]:02x}{base[2]:02x}   {len(marks)} marks\n')
    print(f'{"x0":>7} {"x1":>7} {"w":>6} | {"y0":>7} {"y1":>7} {"h":>6}   (design px)')
    for mx0, mx1, my0, my1 in marks:
        d = lambda v: round(v / scale)  # noqa: E731
        print(
            f'{d(mx0):7} {d(mx1):7} {d(mx1 - mx0):6} |'
            f' {d(my0) + round(y0):7} {d(my1) + round(y0):7} {d(my1 - my0):6}'
        )


if __name__ == '__main__':
    main()
