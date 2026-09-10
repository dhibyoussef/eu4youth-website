"""Sample a band's background so it can be redrawn as a CSS gradient.

Reports the colour at a grid of points, skipping any column the artwork occupies, plus the
fill opacity of the band's vector art. Enough to tell a flat fill from a linear one, find its
direction, and read its end stops.

Usage: python tools/gradient.py IMAGE [MAX_X]
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    name = sys.argv[1]
    max_x = int(sys.argv[2]) if len(sys.argv) > 2 else None

    img = Image.open(ROOT / 'public' / 'img' / name).convert('RGB')
    w, h = img.size
    limit = max_x or w
    px = img.load()

    def hexed(p) -> str:
        return '#%02x%02x%02x' % p

    xs = [2, limit // 4, limit // 2, (limit * 3) // 4, limit - 3]
    ys = [2, h // 4, h // 2, (h * 3) // 4, h - 3]

    print(f'{name}  {w}x{h}   sampling x up to {limit}\n')
    print('        ' + ''.join(f'x={x:<10}' for x in xs))
    for y in ys:
        print(f'y={y:<6}' + ''.join(f'{hexed(px[x, y]):<12}' for x in xs))

    print('\ncorners')
    for label, (x, y) in {
        'top-left': (2, 2),
        'top-right': (limit - 3, 2),
        'bottom-left': (2, h - 3),
        'bottom-right': (limit - 3, h - 3),
        'centre': (limit // 2, h // 2),
    }.items():
        print(f'  {label:14} {hexed(px[x, y])}')


if __name__ == '__main__':
    main()
