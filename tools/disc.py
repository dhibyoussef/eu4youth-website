"""Fit the map band's blue disc and its dashed ring so CSS can draw them.

The disc straddles the band's white strip and its orange block and is overrun by
the right page edge, so cutting it out as a picture means carrying two
backgrounds in one asset. It is a circle with a dashed ring inside it, which CSS
draws exactly and at any size, so this measures the centre, the radius, and where
the dashes sit instead.

Usage: python tools/disc.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / 'AppData/Local/Temp/eu4youth-extract'
BLUE = np.array([7, 77, 161])
# Kept clear of the map pins below and left of the disc, which are the same blue.
WINDOW = (3060, 3300, 1700, 1920)  # y0, y1, x0, x1


def main() -> None:
    y0, y1, x0, x1 = WINDOW
    comp = np.asarray(
        Image.open(OUT / 'renders/Accueil-p1.png').convert('RGB'), dtype=np.int16
    )[y0:y1, x0:x1]

    blue = np.abs(comp - BLUE).max(axis=2) < 60
    rows = np.flatnonzero(blue.any(axis=1))
    top = y0 + int(rows[0])

    # The page edge cuts the disc off, so its width says nothing. Its top edge and
    # its leftmost point do: the leftmost point sits on the horizontal centre line,
    # which gives the centre, and the distance up to the top edge gives the radius.
    leftmost = np.array([np.flatnonzero(row)[0] if row.any() else 10**6
                         for row in blue])
    centre_row = int(np.argmin(leftmost))
    left = x0 + int(leftmost[centre_row])
    cy = y0 + centre_row
    radius = cy - top
    cx = left + radius
    print(f'top edge y {top}   leftmost point ({left}, {cy})')
    print(f'radius {radius}   centre ({cx}, {cy})   diameter {radius * 2}')
    print(f'right edge falls at x {cx + radius} '
          f'(page is 1920, so it overruns by {cx + radius - 1920})')

    # Walk the horizontal centre line outward to find the ring: inside the disc the
    # dashes are a lighter colour than the fill.
    row = comp[int(cy - y0)]
    ring = [i for i, px in enumerate(row)
            if blue[int(cy - y0), i] is np.False_ or np.abs(px - BLUE).max() >= 60]
    scan = np.abs(row - BLUE).max(axis=1) >= 60
    inside = [x0 + i for i in range(int(cx - x0) - int(radius) + 2, int(cx - x0)) if scan[i]]
    if inside:
        print(f'non-fill pixels on the centre line inside the disc: '
              f'x {min(inside)} to {max(inside)}  '
              f'-> ring inset {min(inside) - (cx - radius):.1f} from the disc edge')
    else:
        print('no ring found on the centre line')

    # Dash rhythm along the top of the ring.
    band = comp[:, :]
    dash = np.abs(band - BLUE).max(axis=2) >= 60
    for probe in (0.86, 0.9):
        rr = radius * probe
        angles = np.linspace(np.pi * 0.62, np.pi * 0.98, 900)
        xs = (cx - x0 + rr * np.cos(angles)).astype(int)
        ys = (cy - y0 + rr * np.sin(angles)).astype(int)
        ok = (xs >= 0) & (xs < dash.shape[1]) & (ys >= 0) & (ys < dash.shape[0])
        hits = dash[ys[ok], xs[ok]].astype(int)
        flips = int(np.abs(np.diff(hits)).sum())
        print(f'ring probe at {probe:.2f}r: {flips} transitions along the arc '
              f'-> about {flips // 2} dashes')


if __name__ == '__main__':
    main()
