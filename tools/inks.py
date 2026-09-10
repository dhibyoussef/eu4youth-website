"""Print the colour of the first span on each line in a y range.

rects.py gives the plates; this gives the ink on them. Together they are enough to
rebuild a control without sampling a single pixel.

Usage: python tools/inks.py <pdf stem> <page> <y0> <y1>
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

    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block['lines']:
            top = line['bbox'][1]
            if not (y0 <= top <= y1):
                continue
            for span in line['spans']:
                if not span['text'].strip():
                    continue
                colour = format(span['color'], '06x')
                print(f'y={top:8.1f} x={span["bbox"][0]:7.1f} #{colour} '
                      f'{span["size"]:5.1f} {span["font"][:18]:18s} {span["text"][:50]}')
                break


if __name__ == '__main__':
    main()
