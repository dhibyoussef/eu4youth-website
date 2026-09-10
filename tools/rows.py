"""Report where ink sits, line by line, in the comp and in the build.

align.py answers "is this one block off, and by how much", which needs the
block's measured geometry up front and gives up when its search window guesses
wrong. This is the blunter instrument: give it a box, and it lists every run of
inked rows inside it for both images, so a whole band can be swept at once and
the offsets read straight off.

Ink is anything far from the local background, found per row rather than against
a plate, so it works on regions the build draws itself.

Usage:
  python tools/rows.py home.png Accueil-p1 <x0> <y0> <x1> <y1>
  python tools/rows.py home.png Accueil-p1 60 4150 570 4400 --cols
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"

# A pixel is ink when its channels spread (coloured type) or it is far from the
# region's dominant tone (black or white type on a flat ground).
SPREAD = 40
DISTANCE = 60

# Runs shorter than this are speckle; gaps smaller are the same line.
MIN_HITS = 3
JOIN = 5


def ink_mask(region: np.ndarray) -> np.ndarray:
    spread = region.max(axis=2) - region.min(axis=2)
    tone = np.median(region.reshape(-1, 3), axis=0)
    distance = np.abs(region - tone).max(axis=2)
    return (spread > SPREAD) | (distance > DISTANCE)


def runs(mask: np.ndarray, offset: int, axis: int) -> list[tuple[int, int]]:
    hits = np.flatnonzero(mask.sum(axis=axis) >= MIN_HITS)
    if hits.size == 0:
        return []
    out: list[tuple[int, int]] = []
    start = previous = hits[0]
    for value in hits[1:]:
        if value - previous > JOIN:
            out.append((offset + int(start), offset + int(previous)))
            start = value
        previous = value
    out.append((offset + int(start), offset + int(previous)))
    return out


def main() -> None:
    shot_name, tag = sys.argv[1], sys.argv[2]
    x0, y0, x1, y1 = (int(v) for v in sys.argv[3:7])
    cols = "--cols" in sys.argv

    images = {
        "design": np.asarray(
            Image.open(OUT / "renders" / f"{tag}.png").convert("RGB"), dtype=np.int16
        ),
        "build": np.asarray(
            Image.open(OUT / "shots" / shot_name).convert("RGB"), dtype=np.int16
        ),
    }

    found = {}
    for name, image in images.items():
        mask = ink_mask(image[y0:y1, x0:x1])
        found[name] = (runs(mask, y0, 1), runs(mask, x0, 0) if cols else [])

    axis = "columns" if cols else "rows"
    print(f"box {x0},{y0} -> {x1},{y1}\n")
    for index, (design, build) in enumerate(
        zip(found["design"][0], found["build"][0])
    ):
        shift = design[0] - build[0]
        note = "aligned" if shift == 0 else f"build {abs(shift)}px {'high' if shift > 0 else 'low'}"
        print(
            f"row {index + 1:>2}  design {design[0]:>6}-{design[1]:<6}"
            f"  build {build[0]:>6}-{build[1]:<6}  {note}"
        )

    for name in ("design", "build"):
        extra = found[name][0][min(len(found['design'][0]), len(found['build'][0])):]
        for start, end in extra:
            print(f"       only in {name}: {start}-{end}")

    if cols:
        print()
        for index, (design, build) in enumerate(
            zip(found["design"][1], found["build"][1])
        ):
            shift = design[0] - build[0]
            note = "aligned" if shift == 0 else f"build {abs(shift)}px {'left' if shift > 0 else 'right'}"
            print(
                f"col {index + 1:>2}  design {design[0]:>6}-{design[1]:<6}"
                f"  build {build[0]:>6}-{build[1]:<6}  {note}"
            )

    print(f"\n({axis} compared pairwise, in order)")


if __name__ == "__main__":
    main()
