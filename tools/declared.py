"""List the fill colours a comp declares, by area, straight from its vector data.

Sampling a render answers a different question: a CMYK fill converted for screen
can land a unit or two off what the file actually asks for, and the build should
follow the file. This reads the drawing operators instead, so the numbers are the
comp's own, and reports how much of the page each covers so the brand colours
sort to the top.

Usage: python tools/declared.py [Accueil] [page]
"""

import sys
from collections import defaultdict
from pathlib import Path

import fitz

DESIGN_WIDTH = 1920
DESIGN = Path(__file__).resolve().parents[2] / (
    'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design'
)


def to_hex(colour) -> str:
    if colour is None:
        return 'none'
    if isinstance(colour, (int, float)):
        value = round(colour * 255)
        return '#%02x%02x%02x' % (value, value, value)
    return '#%02x%02x%02x' % tuple(round(c * 255) for c in colour[:3])


def main() -> None:
    stem = sys.argv[1] if len(sys.argv) > 1 else 'Accueil'
    index = int(sys.argv[2]) - 1 if len(sys.argv) > 2 else 0

    doc = fitz.open(DESIGN / f'{stem}.pdf')
    page = doc[index]
    scale = DESIGN_WIDTH / page.rect.width

    area = defaultdict(float)
    boxes = defaultdict(list)
    for drawing in page.get_drawings():
        for key in ('fill', 'color'):
            colour = drawing.get(key)
            if colour is None:
                continue
            rect = drawing['rect']
            size = (rect.width * scale) * (rect.height * scale)
            area[to_hex(colour)] += size
            boxes[to_hex(colour)].append(
                (rect.y0 * scale, rect.x0 * scale, rect.width * scale, rect.height * scale)
            )

    total = sum(area.values()) or 1
    print(f'{stem} p{index + 1}: {len(area)} declared colours\n')
    print(f'{"colour":<10}{"share":>8}{"uses":>7}   largest use (x, y, w, h)')
    for colour, size in sorted(area.items(), key=lambda kv: -kv[1])[:16]:
        biggest = max(boxes[colour], key=lambda b: b[2] * b[3])
        y, x, w, h = biggest
        print(f'{colour:<10}{size / total * 100:7.1f}%{len(boxes[colour]):7d}   '
              f'{x:7.1f}{y:9.1f}{w:8.1f}{h:8.1f}')


if __name__ == '__main__':
    main()
