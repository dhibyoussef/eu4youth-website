"""Exact float geometry for the filled shapes in a y range, unrounded.

tools/band.py rounds to whole px, which is enough for reading a layout but not for deriving a
row rhythm: four rows that are each 121.5 tall read as 121, 122, 121, 122 there, and the gaps
between them come out as 20 and 9 when they are both 14.5.

Usage: python tools/exact.py Y0 Y1 [MIN_WIDTH]
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
    y0, y1 = float(sys.argv[1]), float(sys.argv[2])
    min_w = float(sys.argv[3]) if len(sys.argv) > 3 else 100.0

    with pymupdf.open(PDF) as doc:
        rows = []
        for drawing in doc[0].get_drawings():
            rect = drawing['rect']
            if rect.width < min_w:
                continue
            if not (y0 <= (rect.y0 + rect.y1) / 2 <= y1):
                continue
            fill = drawing['fill']
            hexed = '#' + ''.join(f'{round(c * 255):02x}' for c in fill) if fill else 'none'
            rows.append((rect, hexed))

    rows.sort(key=lambda r: r[0].y0)
    prev_bottom = None
    for rect, hexed in rows:
        gap = '' if prev_bottom is None else f'  gap {rect.y0 - prev_bottom:+8.2f}'
        print(
            f'x {rect.x0:8.2f}..{rect.x1:8.2f}  y {rect.y0:9.2f}..{rect.y1:9.2f}'
            f'  {rect.width:8.2f} x {rect.height:7.2f}  {hexed}{gap}'
        )
        prev_bottom = rect.y1


if __name__ == '__main__':
    main()
