"""Find where a horizontal band of the comp stops being one colour, scanning down a column.

Used to measure the visible edge of artwork that the comp clips rather than places — a photo in
a rounded frame, say, whose placement rect in the file is larger than the part of it that shows.
tools/imgs.py reports the placement, which for those is the wrong number.

Usage: python tools/edgey.py X Y0 Y1   scans down x, printing every colour change
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
    x = float(sys.argv[1])
    y0, y1 = float(sys.argv[2]), float(sys.argv[3])

    with pymupdf.open(PDF) as doc:
        page = doc[0]
        clip = pymupdf.Rect(x, y0, x + 1, y1)
        pix = page.get_pixmap(clip=clip, dpi=72)

    prev = None
    for row in range(pix.height):
        here = pix.pixel(0, row)
        if prev is not None and max(abs(a - b) for a, b in zip(here, prev)) > 14:
            print(f'y {y0 + row:9.2f}   {prev} -> {here}')
        prev = here


if __name__ == '__main__':
    main()
