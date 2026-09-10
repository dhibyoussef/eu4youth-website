"""List the button rectangles a comp prints, from its vector data.

The bands that are still served as crops carry the comp's own printed buttons, and
a live button drawn over one only lines up at the design's own 1920 width. At any
other width the page scales by 100vw/192, so the crop is resampled as a bitmap
while the button is scaled as geometry, and their edges land on different
subpixels — a sliver of the printed button along whichever edge falls short. The
cure is to take the printed buttons out of the crops, which needs their rectangles.

Usage: python tools/btnfind.py [y0] [y1]
"""

import sys
from pathlib import Path

import fitz

DESIGN_WIDTH = 1920
DESIGN = Path(__file__).resolve().parents[2] / (
    'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design'
)

# A button is a wide, short rectangle; this rules out bands, rules and watermarks.
MIN_WIDTH, MAX_WIDTH = 180, 700
MIN_HEIGHT, MAX_HEIGHT = 60, 130


def to_hex(colour) -> str:
    if colour is None:
        return 'none'
    if isinstance(colour, (int, float)):
        v = round(colour * 255)
        return '#%02x%02x%02x' % (v, v, v)
    return '#%02x%02x%02x' % tuple(round(c * 255) for c in colour[:3])


def main() -> None:
    y0 = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
    y1 = float(sys.argv[2]) if len(sys.argv) > 2 else 1e9

    doc = fitz.open(DESIGN / 'Accueil.pdf')
    page = doc[0]
    scale = DESIGN_WIDTH / page.rect.width

    print(f'{"x":>8}{"y":>9}{"w":>8}{"h":>7}   {"fill":<10}{"stroke":<10}width')
    found = 0
    for drawing in page.get_drawings():
        rect = drawing['rect']
        x, y = rect.x0 * scale, rect.y0 * scale
        w, h = rect.width * scale, rect.height * scale
        if not (MIN_WIDTH <= w <= MAX_WIDTH and MIN_HEIGHT <= h <= MAX_HEIGHT):
            continue
        if not (y0 <= y <= y1):
            continue
        found += 1
        line = (drawing.get('width') or 0) * scale
        print(f'{x:8.1f}{y:9.1f}{w:8.1f}{h:7.1f}   '
              f'{to_hex(drawing.get("fill")):<10}{to_hex(drawing.get("color")):<10}{line:.1f}')
    print(f'\n{found} candidate rectangles in y {y0} to {y1}')


if __name__ == '__main__':
    main()
