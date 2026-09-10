"""Compare the measure of each justified column against the comp.

A justified line's last glyph is flush with the column's right edge, so the ink's
right edge measures the column width directly. That matters because the span
widths reported by the PDF include the trailing space at each line break: taking
them at face value makes every column a little too wide, which inflates the slack
the browser shares out between words and walks the interior words out of place.

Usage:  python tools/columns.py home.png Accueil-p1
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"

# name, x window around the expected right edge, ink colour, tolerance, and the
# y bands of the justified lines. The last line of a paragraph is left out: it is
# not justified, so it does not measure the column.
#
# The x window is deliberately narrow and the colour is the type's own, because
# several of these paragraphs sit on photography where a plain light/dark test
# finds the artwork instead of the text.
BLOCKS: list[tuple[str, int, int, tuple[int, int, int], int, list[tuple[int, int]]]] = [
    ("projets body", 1760, 1860, (0, 0, 0), 90, [(2640, 2668), (2678, 2706), (2716, 2744)]),
    ("map body", 760, 860, (255, 255, 255), 40, [(3555, 3585), (3592, 3622), (3630, 3660)]),
    ("card body", 1150, 1240, (0, 0, 0), 90, [(4842, 4866), (4872, 4896)]),
    ("pubs body", 900, 1000, (255, 255, 255), 30, [(7994, 8028), (8071, 8105)]),
    ("news body", 860, 960, (0, 0, 0), 90, [(8844, 8878), (8882, 8916)]),
    ("news legal", 860, 960, (0, 0, 0), 90, [(9200, 9226), (9226, 9250)]),
    ("footer disclaimer", 1760, 1860, (255, 255, 255), 60, [(10174, 10196), (10202, 10224)]),
]


def main() -> None:
    shot_name, tag = sys.argv[1], sys.argv[2]
    images = {
        "design": np.asarray(
            Image.open(OUT / "renders" / f"{tag}.png").convert("RGB"), dtype=np.int16
        ),
        "build": np.asarray(
            Image.open(OUT / "shots" / shot_name).convert("RGB"), dtype=np.int16
        ),
    }

    worst = 0
    for name, x0, x1, colour, tolerance, bands in BLOCKS:
        edges = {}
        for label, image in images.items():
            rights = []
            for y0, y1 in bands:
                region = image[y0:y1, x0:x1]
                mask = np.abs(region - np.array(colour)).max(axis=2) < tolerance
                columns = np.flatnonzero(mask.any(axis=0))
                if columns.size:
                    rights.append(x0 + int(columns.max()))
            edges[label] = rights

        if not edges["design"] or not edges["build"]:
            print(f"{name:<20} no ink in window {x0}-{x1}")
            continue

        delta = max(edges["build"]) - max(edges["design"])
        worst = max(worst, abs(delta))
        note = (
            "matches"
            if delta == 0
            else f"{abs(delta)}px too {'wide' if delta > 0 else 'narrow'}"
        )
        print(
            f"{name:<20} design right {max(edges['design']):>5}"
            f"   build {max(edges['build']):>5}   {note}"
        )

    print(f"\nworst measure error: {worst}px")


if __name__ == "__main__":
    main()
