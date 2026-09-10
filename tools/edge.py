"""List curved drawings that run off a comp page's right edge.

The disc the a-propos comp repeats at four band seams is cut in half by the page edge, so
it is not square and a search for square shapes misses it. What it is, is round and hard
against x=1920.

Usage: python tools/edge.py "a propos" [page]
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

    page = pymupdf.open(SRC / f'{stem}.pdf')[page_no - 1]
    edge = page.rect.width

    for drawing in page.get_drawings():
        x0, y0, x1, y1 = drawing['rect']
        if x1 < edge - 8 or y1 - y0 < 60:
            continue
        curves = sum(1 for item in drawing['items'] if item[0] == 'c')
        if not curves:
            continue
        print(f'x={x0:7.1f}-{x1:7.1f} y={y0:8.1f}-{y1:8.1f} '
              f'{x1 - x0:6.1f}x{y1 - y0:<6.1f} curves={curves:<3d} '
              f'items={len(drawing["items"]):<3d} '
              f'fill={hexed(drawing.get("fill")):8s} '
              f'stroke={hexed(drawing.get("color")):8s} '
              f'w={drawing.get("width") or 0:4.1f} '
              f'dashes={drawing.get("dashes") or "-"}')


if __name__ == '__main__':
    main()
