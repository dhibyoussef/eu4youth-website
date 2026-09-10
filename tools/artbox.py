"""Measure the true bounds of the avenir signpost in the comp.

The artwork shipped from a guessed clip, and the guess cut it: the Ben Gardane sign lost its
left point, the pole lost its top, and the crop carried a slab of empty band on the right that
pushed everything visible off the page edge once it was placed by its right edge.

Usage: python tools/artbox.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pymupdf

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design' / 'a propos.pdf')

BAND = (11726, 13053)
BAND_PINK = (218, 56, 112)


def main() -> None:
    with pymupdf.open(SRC) as doc:
        page = doc[0]
        clip = pymupdf.Rect(0, BAND[0], 1920, BAND[1])
        pix = page.get_pixmap(matrix=pymupdf.Matrix(1, 1), clip=clip, alpha=False)
        rgb = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)

    # The band's pink is a gradient, so "not the band" is a range rather than one colour.
    ink = np.abs(rgb.astype(np.int16) - np.array(BAND_PINK)).max(axis=2) > 30

    # The accordion is the only white in the band, so its rightmost white pixel is where the
    # artwork's column starts. Measuring from a guessed x caught the rows' orange chevrons.
    white = (rgb.min(axis=2) > 246)
    left = int(np.where(white.any(axis=0))[0][-1]) + 4
    print(f'accordion ends x {left - 4}')

    art = ink.copy()
    art[:, :left] = False
    rows = np.where(art.any(axis=1))[0]
    cols = np.where(art.any(axis=0))[0]

    x0, x1 = int(cols[0]), int(cols[-1]) + 1
    y0, y1 = BAND[0] + int(rows[0]), BAND[0] + int(rows[-1]) + 1

    print(f'band      y {BAND[0]}..{BAND[1]}  ({BAND[1] - BAND[0]} tall)')
    print(f'art       x {x0}..{x1}  y {y0}..{y1}')
    print(f'          {x1 - x0} x {y1 - y0}')
    print(f'placement right {1920 - x1}   top {y0 - BAND[0]} from band top')
    print(f'          bottom {BAND[1] - y1} above band bottom')


if __name__ == '__main__':
    main()
