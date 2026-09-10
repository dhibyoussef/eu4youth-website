"""Dump every distinct line of text on a comp page, with position and size.

Usage: python tools/page.py <pdf stem> <page>
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

SRC = (Path(__file__).resolve().parents[2]
       / 'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design')


def main() -> None:
    stem, page_no = sys.argv[1], int(sys.argv[2])
    page = pymupdf.open(SRC / f'{stem}.pdf')[page_no - 1]

    seen: set[str] = set()
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block['lines']:
            text = ' '.join(s['text'] for s in line['spans']).strip()
            if not text or text in seen:
                continue
            seen.add(text)
            span = line['spans'][0]
            print(f'y={line["bbox"][1]:8.1f} x={line["bbox"][0]:7.1f} '
                  f'{span["size"]:5.1f} #{span["color"]:06x} {text[:70]}')


if __name__ == '__main__':
    main()
