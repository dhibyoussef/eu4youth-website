"""Compare a button's printed rectangle in the comp with the live one in the build.

Where a band is still served as a crop of the comp, that crop carries the comp's
own printed button. The live button is drawn over it, so any disagreement between
the two shows as a sliver of the printed one along whichever edge is short. This
reports both rectangles so the disagreement reads as an offset rather than a
guess.

Usage: python tools/btnrect.py <x> <y> <w> <h> <#hexbutton> [tolerance]
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / 'AppData/Local/Temp/eu4youth-extract'


def rect(image: np.ndarray, target: np.ndarray, tolerance: int):
    hit = np.abs(image - target).max(axis=2) <= tolerance
    # Rows and columns that are mostly the button colour, so the label inside it
    # and any stray matching pixel outside cannot move the edges.
    rows = np.flatnonzero(hit.mean(axis=1) > 0.5)
    cols = np.flatnonzero(hit.mean(axis=0) > 0.5)
    if not rows.size or not cols.size:
        return None
    return int(cols[0]), int(rows[0]), int(cols[-1] - cols[0] + 1), int(rows[-1] - rows[0] + 1)


def main() -> None:
    x, y, w, h = (int(v) for v in sys.argv[1:5])
    hexed = sys.argv[5].lstrip('#')
    tolerance = int(sys.argv[6]) if len(sys.argv) > 6 else 30
    target = np.array([int(hexed[i:i + 2], 16) for i in (0, 2, 4)])

    window = (slice(y, y + h), slice(x, x + w))
    comp = np.asarray(Image.open(OUT / 'renders/Accueil-p1.png').convert('RGB'),
                      dtype=np.int16)[window]
    build = np.asarray(Image.open(OUT / 'shots/home.png').convert('RGB'),
                       dtype=np.int16)[window]

    a, b = rect(comp, target, tolerance), rect(build, target, tolerance)
    print(f'window x {x} y {y} w {w} h {h}   looking for #{hexed} +/-{tolerance}')
    for label, found in (('comp ', a), ('build', b)):
        if found is None:
            print(f'  {label}: not found')
        else:
            print(f'  {label}: x {x + found[0]:5d}  y {y + found[1]:5d}'
                  f'  w {found[2]:4d}  h {found[3]:4d}'
                  f'   right {x + found[0] + found[2]:5d}'
                  f'  bottom {y + found[1] + found[3]:5d}')
    if a and b:
        print(f'  delta: left {b[0] - a[0]:+d}  top {b[1] - a[1]:+d}'
              f'  width {b[2] - a[2]:+d}  height {b[3] - a[3]:+d}')


if __name__ == '__main__':
    main()
