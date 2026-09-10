"""List the roughly square drawings on a comp page, which is where its discs live.

The a-propos comp repeats a blue disc with a dashed ring inside it at the right edge of
four bands, straddling the seam between them. Finding it by eye in a list of every path on
a 9000px page is hopeless; finding it by shape is not.

Usage: python tools/rounds.py "a propos" [page] [min-size]
"""

import sys
from pathlib import Path

import pymupdf

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design')


def hexed(colour) -> str:
    if colour is None:
        return '—'
    return '#%02x%02x%02x' % tuple(round(channel * 255) for channel in colour)


def main() -> None:
    stem = sys.argv[1]
    page_no = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    smallest = float(sys.argv[3]) if len(sys.argv) > 3 else 90.0

    page = pymupdf.open(SRC / f'{stem}.pdf')[page_no - 1]

    for drawing in page.get_drawings():
        x0, y0, x1, y1 = drawing['rect']
        width, height = x1 - x0, y1 - y0
        if width < smallest or height < smallest or abs(width - height) > smallest / 2:
            continue
        curves = sum(1 for item in drawing['items'] if item[0] == 'c')
        if not curves:
            continue
        print(f'x={x0:7.1f}-{x1:7.1f} y={y0:8.1f}-{y1:8.1f} '
              f'{width:6.1f}x{height:<6.1f} curves={curves:<3d} '
              f'fill={hexed(drawing.get("fill")):8s} '
              f'stroke={hexed(drawing.get("color")):8s} '
              f'w={drawing.get("width") or 0:4.1f} '
              f'dashes={drawing.get("dashes") or "-"}')


if __name__ == '__main__':
    main()
