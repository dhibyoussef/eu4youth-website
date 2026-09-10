"""Report each logo's own box in a comp band's logo row.

A logo row is drawn as many small images and vector paths per mark, so no single bbox in
the file corresponds to a logo. Clustering every piece of ink in the row's y range by
horizontal gap recovers one box per mark, which is what the row has to be built from: the
comp does not size these to a common width, it fits each one inside a common height.

Usage: python tools/logobox.py Y0 Y1 [PAGE]
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


def pieces(page: pymupdf.Page, y0: float, y1: float) -> list[tuple[float, float, float, float]]:
    """Every image and vector bbox whose centre falls inside the row."""
    out = []
    for info in page.get_image_info():
        box = info['bbox']
        if y0 <= (box[1] + box[3]) / 2 <= y1:
            out.append(tuple(box))
    for path in page.get_drawings():
        box = path['rect']
        if y0 <= (box.y0 + box.y1) / 2 <= y1:
            out.append((box.x0, box.y0, box.x1, box.y1))
    return out


def cluster(boxes, gap: float = 24.0):
    """Group boxes into marks: a run of ink with no horizontal gap wider than `gap`."""
    marks = []
    for box in sorted(boxes, key=lambda b: b[0]):
        if marks and box[0] - marks[-1][2] <= gap:
            last = marks[-1]
            marks[-1] = (
                min(last[0], box[0]),
                min(last[1], box[1]),
                max(last[2], box[2]),
                max(last[3], box[3]),
            )
        else:
            marks.append(box)
    return marks


def main() -> None:
    y0, y1 = float(sys.argv[1]), float(sys.argv[2])
    page_no = int(sys.argv[3]) if len(sys.argv) > 3 else 0

    with pymupdf.open(PDF) as doc:
        marks = cluster(pieces(doc[page_no], y0, y1))

    print(f'{len(marks)} marks in y {y0:.0f}..{y1:.0f}\n')
    print(f'{"x0":>7} {"x1":>7} {"w":>6} | {"y0":>7} {"y1":>7} {"h":>6} | ratio')
    for x0, my0, x1, my1 in marks:
        w, h = x1 - x0, my1 - my0
        print(
            f'{x0:7.0f} {x1:7.0f} {w:6.0f} | {my0:7.0f} {my1:7.0f} {h:6.0f} |'
            f' {w / h if h else 0:5.2f}'
        )

    if marks:
        top = min(m[1] for m in marks)
        bottom = max(m[3] for m in marks)
        print(f'\nrow ink: y {top:.0f}..{bottom:.0f}  ({bottom - top:.0f} tall)')
        print(f'row ink: x {min(m[0] for m in marks):.0f}..{max(m[2] for m in marks):.0f}')
        gaps = [marks[i + 1][0] - marks[i][2] for i in range(len(marks) - 1)]
        print('gaps between marks:', ' '.join(f'{g:.0f}' for g in gaps))


if __name__ == '__main__':
    main()
