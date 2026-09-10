"""List where a comp places its images in a y range.

Usage: python tools/imgs.py <pdf stem> <page> <y0> <y1>
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

SRC = (Path(__file__).resolve().parents[2]
       / 'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design')


def main() -> None:
    stem, page_no = sys.argv[1], int(sys.argv[2])
    y0, y1 = float(sys.argv[3]), float(sys.argv[4])

    page = pymupdf.open(SRC / f'{stem}.pdf')[page_no - 1]

    for info in page.get_image_info(xrefs=True):
        x0, top, x1, bottom = info['bbox']
        if not (y0 <= top <= y1):
            continue
        print(f'x={x0:7.1f}-{x1:7.1f} y={top:8.1f}-{bottom:8.1f} '
              f'placed={x1 - x0:6.1f}x{bottom - top:<6.1f} '
              f'native={info["width"]}x{info["height"]} xref={info["xref"]}')


if __name__ == '__main__':
    main()
