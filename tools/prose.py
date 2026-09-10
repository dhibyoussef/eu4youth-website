"""Reassemble a comp page's copy into paragraphs, ready to become content data.

text.py prints spans, which is right for chasing a half-pixel of tracking but wrong
for reading: justified paragraphs are stored one word per span, so a six-line
paragraph arrives as sixty lines. This groups spans back into paragraphs — same
font, same size, consecutive baselines, one column — and prints each as a single
string with the metrics that decide how it is styled.

Usage: python tools/copy.py <pdf stem> <page> [y0] [y1]
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

SRC = (Path(__file__).resolve().parents[2]
       / 'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design')

# A gap larger than this many multiples of the line height starts a new paragraph.
PARAGRAPH_GAP = 1.6


def main() -> None:
    stem, page_no = sys.argv[1], int(sys.argv[2])
    y0 = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
    y1 = float(sys.argv[4]) if len(sys.argv) > 4 else 1e9

    page = pymupdf.open(SRC / f'{stem}.pdf')[page_no - 1]

    lines = []
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block['lines']:
            spans = [s for s in line['spans'] if s['text'].strip()]
            if not spans or not (y0 <= line['bbox'][1] <= y1):
                continue
            # Words of a justified line share a baseline; join them with the spaces
            # the PDF drops, and take the line's own left edge and metrics.
            text = ' '.join(s['text'].strip() for s in spans)
            lines.append({
                'y': round(line['bbox'][1], 1),
                'x': round(min(s['bbox'][0] for s in spans), 1),
                'right': round(max(s['bbox'][2] for s in spans), 1),
                'size': round(spans[0]['size'], 1),
                'font': spans[0]['font'],
                'text': text,
            })

    lines.sort(key=lambda l: (l['y'], l['x']))

    paragraphs = []
    for line in lines:
        previous = paragraphs[-1] if paragraphs else None
        same_style = (previous
                      and previous['font'] == line['font']
                      and previous['size'] == line['size'])
        # Left edges must agree for it to be the same column, and the baseline step
        # must look like leading rather than a jump to another element.
        step = line['y'] - previous['last_y'] if previous else 0
        if (same_style and abs(previous['x'] - line['x']) <= 2
                and 0 < step <= line['size'] * PARAGRAPH_GAP):
            previous['text'] += ' ' + line['text']
            previous['last_y'] = line['y']
            previous['right'] = max(previous['right'], line['right'])
        else:
            paragraphs.append({**line, 'last_y': line['y']})

    for p in paragraphs:
        width = p['right'] - p['x']
        print(f"y={p['y']:8.1f} x={p['x']:7.1f} w={width:7.1f} "
              f"{p['size']:5.1f} {p['font'][:20]:20s} {p['text']}")

    print(f'\n{len(paragraphs)} paragraphs from {len(lines)} lines')


if __name__ == '__main__':
    main()
