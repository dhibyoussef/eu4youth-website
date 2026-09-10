"""Detect background band boundaries by sampling a column of the page render.

Sampling the far-left edge (x=6) avoids most foreground content, so colour
changes there correspond to full-width section backgrounds.

Usage:  python tools/bands.py Accueil-p1 [x]
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"


def scan_row(pix: pymupdf.Pixmap, y: int) -> None:
    """Print colour across a row — reveals horizontal gradients."""
    print(f"\n# horizontal scan at y={y}")
    for x in range(0, pix.width, pix.width // 12):
        r, g, b = pix.pixel(min(x, pix.width - 1), y)[:3]
        print(f"  x={x:>5}  #{r:02X}{g:02X}{b:02X}")


def main() -> None:
    tag = sys.argv[1]
    x = int(sys.argv[2]) if len(sys.argv) > 2 else 6

    pix = pymupdf.Pixmap(OUT / "renders" / f"{tag}.png")

    if len(sys.argv) > 3 and sys.argv[3] == "row":
        for y in sys.argv[4:]:
            scan_row(pix, int(y))
        return

    print(f"# {tag}  render {pix.width}x{pix.height}  sampling x={x}\n")
    print(f"{'from':>8} {'to':>8} {'h':>8}  colour")

    start = 0
    previous = pix.pixel(x, 0)
    for y in range(1, pix.height):
        current = pix.pixel(x, y)
        if max(abs(a - b) for a, b in zip(current, previous)) > 10:
            if y - start > 6:
                print(
                    f"{start:>8} {y:>8} {y - start:>8}  "
                    f"#{previous[0]:02X}{previous[1]:02X}{previous[2]:02X}"
                )
            start = y
            previous = current

    print(
        f"{start:>8} {pix.height:>8} {pix.height - start:>8}  "
        f"#{previous[0]:02X}{previous[1]:02X}{previous[2]:02X}"
    )


if __name__ == "__main__":
    main()
