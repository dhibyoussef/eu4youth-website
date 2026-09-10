"""Compare where ink actually falls, comp against build, inside a given box.

Band-level difference percentages say something is wrong but not which way to
move it. This reports the ink bounding box on both sides, so a placement error
reads directly as the offset and size change needed.

Usage: python tools/inkbox.py <x> <y> <w> <h> [tolerance-from-white]
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / 'AppData/Local/Temp/eu4youth-extract'


def box(image: np.ndarray, tolerance: int) -> tuple[int, int, int, int] | None:
    # Anything darker than near-white counts as ink. These strips sit on flat
    # white, so this needs no background model.
    ink = image.min(axis=2) < 255 - tolerance
    rows = np.flatnonzero(ink.any(axis=1))
    cols = np.flatnonzero(ink.any(axis=0))
    if not rows.size or not cols.size:
        return None
    return int(cols[0]), int(rows[0]), int(cols[-1] - cols[0] + 1), int(rows[-1] - rows[0] + 1)


def main() -> None:
    x, y, w, h = (int(v) for v in sys.argv[1:5])
    tolerance = int(sys.argv[5]) if len(sys.argv) > 5 else 6

    comp = np.asarray(Image.open(OUT / 'renders/Accueil-p1.png').convert('RGB'),
                      dtype=np.int16)[y:y + h, x:x + w]
    build = np.asarray(Image.open(OUT / 'shots/home.png').convert('RGB'),
                       dtype=np.int16)[y:y + h, x:x + w]

    a, b = box(comp, tolerance), box(build, tolerance)
    print(f'window  x {x}  y {y}  w {w}  h {h}   ink darker than {255 - tolerance}')
    for label, found in (('comp ', a), ('build', b)):
        if found is None:
            print(f'  {label}: no ink')
        else:
            print(f'  {label}: x {x + found[0]:5d}  y {y + found[1]:5d}'
                  f'  w {found[2]:4d}  h {found[3]:4d}')
    if a and b:
        print(f'  delta: x {b[0] - a[0]:+d}  y {b[1] - a[1]:+d}'
              f'  w {b[2] - a[2]:+d}  h {b[3] - a[3]:+d}')
        delta = np.abs(build - comp).max(axis=2)
        print(f'  heavy {(delta > 85).mean() * 100:.2f}%   soft {(delta > 24).mean() * 100:.2f}%')


if __name__ == '__main__':
    main()
