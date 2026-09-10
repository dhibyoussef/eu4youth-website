"""Per-span text detail: font name, size, weight flags and ink box.

tools/band.py joins the spans in a line, which hides the case the comp uses constantly — one
heading set in two weights, a category word light and its qualifier bold. Joined, that reads as
a single Changa-Regular run and gets built as one weight.

Usage: python tools/spans.py Y0 Y1 [PDF_STEM]
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

DESIGN = (
    Path(__file__).resolve().parents[2] / 'EU4Youth' / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design'
)


def main() -> None:
    y0, y1 = float(sys.argv[1]), float(sys.argv[2])
    stem = sys.argv[3] if len(sys.argv) > 3 else 'a propos'

    with pymupdf.open(DESIGN / f'{stem}.pdf') as doc:
        page = doc[0]
        data = page.get_text('rawdict')

    for block in data['blocks']:
        for line in block.get('lines', ()):
            for span in line['spans']:
                x0, sy0, x1, sy1 = span['bbox']
                if not (y0 <= (sy0 + sy1) / 2 <= y1):
                    continue
                chars = span.get('chars', ())
                text = ''.join(c['c'] for c in chars)
                print(
                    f'x {x0:8.2f}..{x1:8.2f}  adv {x1 - x0:7.2f}  sz {span["size"]:6.2f}'
                    f'  {span["font"]:26.26}  {text!r}'
                )


if __name__ == '__main__':
    main()
