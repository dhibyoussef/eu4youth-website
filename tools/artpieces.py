"""Find the artwork left in a band once its flat background is discounted.

A band that is flat colour plus a few decorations does not need to be served as a
picture at all: CSS can draw the colour and the decorations can be cut out as
small transparent images. This finds those decorations by dropping every pixel
close to the band's background colour and reporting the bounding boxes of what
survives, so each can be cut and placed instead of shipping the whole band.

Usage: python tools/artpieces.py <band-top> <band-bottom> <#hexbackground> [tol]
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

OUT = Path.home() / 'AppData/Local/Temp/eu4youth-extract'


def main() -> None:
    top, bottom = int(sys.argv[1]), int(sys.argv[2])
    background = sys.argv[3].lstrip('#')
    tolerance = int(sys.argv[4]) if len(sys.argv) > 4 else 12

    target = np.array([int(background[i:i + 2], 16) for i in (0, 2, 4)])
    comp = np.asarray(
        Image.open(OUT / 'renders/Accueil-p1.png').convert('RGB'), dtype=np.int16
    )[top:bottom]

    ink = np.abs(comp - target).max(axis=2) > tolerance
    print(f'band {top}-{bottom} on #{background}: {ink.mean() * 100:.1f}% of pixels '
          f'are not the background')

    # Dilate before labelling so that a logo's separate strokes, or a heading's
    # separate letters, report as one piece rather than hundreds.
    grown = ndimage.binary_dilation(ink, np.ones((9, 9), bool))
    labels, count = ndimage.label(grown)
    print(f'{count} pieces before filtering\n')

    pieces = []
    for y_slice, x_slice in ndimage.find_objects(labels):
        area = int(ink[y_slice, x_slice].sum())
        if area < 400:
            continue
        pieces.append((y_slice.start, x_slice.start,
                       x_slice.stop - x_slice.start,
                       y_slice.stop - y_slice.start, area))

    print(f'{"y(abs)":>8}{"x":>7}{"w":>7}{"h":>7}{"ink px":>9}')
    for y, x, w, h, area in sorted(pieces):
        print(f'{top + y:8d}{x:7d}{w:7d}{h:7d}{area:9d}')


if __name__ == '__main__':
    main()
