"""Find the comp's band seams by sampling its left edge down the page.

Bands are full-bleed colour, so the y where the left edge changes colour is the seam. Reading
them off the page beats keeping them by hand: a table of guessed seams makes every band height
comparison lie, which is worse than not comparing at all.

Usage: python tools/seams.py [X]
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

PDF = (
    Path(__file__).resolve().parents[2]
    / 'EU4Youth'
    / 'UI Web Design-20260807T094637Z-1-001'
    / 'UI Web Design'
    / 'a propos.pdf'
)


def main() -> None:
    x = int(sys.argv[1]) if len(sys.argv) > 1 else 6

    with pymupdf.open(PDF) as doc:
        page = doc[0]
        pix = page.get_pixmap(dpi=72)

    def at(y: int) -> tuple[int, int, int]:
        return pix.pixel(x, y)[:3]

    def near(a, b, tol=10) -> bool:
        return all(abs(p - q) <= tol for p, q in zip(a, b))

    seams = []
    run_start = 0
    colour = at(0)
    for y in range(1, pix.height):
        here = at(y)
        if near(here, colour):
            continue
        # Only a run of the new colour counts, so anti-aliased edges are not seams.
        if y + 4 < pix.height and near(at(y + 4), here, 6):
            seams.append((run_start, y, colour))
            run_start = y
            colour = here

    seams.append((run_start, pix.height, colour))

    print(f'sampled x={x}, page {pix.width}x{pix.height}\n')
    print(f'{"y0":>7} {"y1":>7} {"height":>7}  colour')
    for y0, y1, rgb in seams:
        if y1 - y0 < 12:
            continue
        print(f'{y0:7} {y1:7} {y1 - y0:7}  #{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}')


if __name__ == '__main__':
    main()
