"""Dump the comp's round vector art with its stroke settings.

The dashed disc that bleeds off the right edge of several bands is a stroked circle in the
PDF, not a picture, so its centre, radius, dash pattern, stroke width and colours can be read
exactly rather than traced. Anything roughly square and large enough to be the disc is listed.

Usage: python tools/discs.py Y0 Y1 [MIN_SIZE]
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


def rgb(colour) -> str:
    if colour is None:
        return '-'
    return '#' + ''.join(f'{round(c * 255):02x}' for c in colour)


def main() -> None:
    y0, y1 = float(sys.argv[1]), float(sys.argv[2])
    min_size = float(sys.argv[3]) if len(sys.argv) > 3 else 80.0

    with pymupdf.open(PDF) as doc:
        page = doc[0]
        for drawing in page.get_drawings():
            rect = drawing['rect']
            centre_y = (rect.y0 + rect.y1) / 2
            if not y0 <= centre_y <= y1:
                continue
            if rect.width < min_size and rect.height < min_size:
                continue
            kinds = {item[0] for item in drawing['items']}
            # A circle is drawn as four beziers; a rectangle has no curve in it at all.
            if 'c' not in kinds:
                continue
            print(
                f"x {rect.x0:8.1f}..{rect.x1:8.1f}  y {rect.y0:9.1f}..{rect.y1:9.1f}"
                f"  {rect.width:7.1f}x{rect.height:7.1f}"
            )
            print(
                f"    centre ({(rect.x0 + rect.x1) / 2:.1f}, {centre_y:.1f})"
                f"  r {rect.width / 2:.1f} / {rect.height / 2:.1f}"
                f"  fill {rgb(drawing['fill'])}  stroke {rgb(drawing['color'])}"
                f"  width {drawing.get('width') or 0:.2f}"
            )
            print(
                f"    dashes {drawing.get('dashes')!r}  closed {drawing.get('closePath')}"
                f"  items {len(drawing['items'])} {sorted(kinds)}"
            )


if __name__ == '__main__':
    main()
