"""List the filled and stroked rectangles a comp draws in a y range.

Sampling pixels tells you what colour a band ended up; this tells you what the designer
actually drew — the plate behind a button, the fill of an accordion header, the stroke
weight of an outline — with its exact rectangle and colour. That is what a control needs
to be rebuilt as a control rather than approximated.

Usage: python tools/rects.py <pdf stem> <page> <y0> <y1> [minWidth]
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

SRC = (Path(__file__).resolve().parents[2]
       / 'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design')


def hexed(colour: tuple[float, ...] | None) -> str:
    if colour is None:
        return '—'
    return '#' + ''.join(f'{round(c * 255):02x}' for c in colour[:3])


def main() -> None:
    stem, page_no = sys.argv[1], int(sys.argv[2])
    y0, y1 = float(sys.argv[3]), float(sys.argv[4])
    min_width = float(sys.argv[5]) if len(sys.argv) > 5 else 40.0

    page = pymupdf.open(SRC / f'{stem}.pdf')[page_no - 1]

    for drawing in page.get_drawings():
        x0, top, x1, bottom = drawing['rect']
        if not (y0 <= top <= y1) or x1 - x0 < min_width:
            continue
        radius = ''
        for item in drawing['items']:
            if item[0] == 'c':  # a curve in the outline means rounded corners
                radius = ' rounded'
                break
        print(f'x={x0:7.1f}-{x1:7.1f} w={x1 - x0:7.1f}  '
              f'y={top:8.1f}-{bottom:8.1f} h={bottom - top:6.1f}  '
              f'fill={hexed(drawing.get("fill")):8s} '
              f'stroke={hexed(drawing.get("color")):8s} '
              f'width={drawing.get("width") or 0:4.1f}{radius}')


if __name__ == '__main__':
    main()
