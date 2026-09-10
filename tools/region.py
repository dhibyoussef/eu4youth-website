"""Render one rectangle of the comp at a chosen zoom, to look at it closely.

Usage: python tools/region.py X0 Y0 X1 Y1 [OUT.png] [ZOOM]
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


def main() -> None:
    x0, y0, x1, y1 = (float(v) for v in sys.argv[1:5])
    out = sys.argv[5] if len(sys.argv) > 5 else 'tools/out/region.png'
    zoom = float(sys.argv[6]) if len(sys.argv) > 6 else 2.0

    with pymupdf.open(PDF) as doc:
        pix = doc[0].get_pixmap(
            matrix=pymupdf.Matrix(zoom, zoom), clip=pymupdf.Rect(x0, y0, x1, y1)
        )

    target = Path(__file__).resolve().parents[1] / out
    target.parent.mkdir(parents=True, exist_ok=True)
    pix.save(target)
    print(f'{out}  {pix.width}x{pix.height}  from x {x0:.0f}..{x1:.0f} y {y0:.0f}..{y1:.0f}')


if __name__ == '__main__':
    main()
