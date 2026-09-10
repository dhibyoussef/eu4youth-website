"""Dump a comp band's text lines and its filled rectangles.

Band heights that disagree with the comp are almost never one wrong number; they are a title
that wraps differently, a row that is taller, or padding that was guessed. Reading the band's
lines with their sizes and its card rectangles gives the numbers to set instead of guessing.

Usage: python tools/band.py Y0 Y1 [MIN_RECT_W]
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
    min_w = float(sys.argv[3]) if len(sys.argv) > 3 else 300.0

    with pymupdf.open(PDF) as doc:
        page = doc[0]

        print(f'=== text lines in y {y0:.0f}..{y1:.0f} ===')
        for block in page.get_text('dict')['blocks']:
            if block['type'] != 0:
                continue
            for line in block['lines']:
                bx0, by0, bx1, by1 = line['bbox']
                if not y0 < by0 < y1:
                    continue
                text = ''.join(span['text'] for span in line['spans'])
                size = line['spans'][0]['size']
                font = line['spans'][0]['font']
                print(
                    f'x {bx0:6.0f}..{bx1:6.0f}  y {by0:7.0f}..{by1:7.0f}'
                    f'  sz {size:5.1f}  {font[:18]:18}  {text[:56]}'
                )

        print(f'\n=== filled rects wider than {min_w:.0f} ===')
        seen = set()
        for drawing in page.get_drawings():
            rect = drawing['rect']
            if not y0 < (rect.y0 + rect.y1) / 2 < y1:
                continue
            if rect.width < min_w or rect.height < 8:
                continue
            key = (round(rect.x0), round(rect.y0), round(rect.x1), round(rect.y1))
            if key in seen:
                continue
            seen.add(key)
            fill = drawing['fill']
            rgb = (
                '-'
                if fill is None
                else '#' + ''.join(f'{round(c * 255):02x}' for c in fill)
            )
            print(
                f'x {rect.x0:6.0f}..{rect.x1:6.0f}  y {rect.y0:7.0f}..{rect.y1:7.0f}'
                f'  w {rect.width:6.0f} h {rect.height:5.0f}  {rgb}'
            )


if __name__ == '__main__':
    main()
