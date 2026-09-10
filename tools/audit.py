"""Rank where the build disagrees with the comp, worst first.

diff.py draws the mismatch; this measures it. The page is cut into horizontal
slices and each is scored by the share of pixels that differ, so attention goes
to the bands that are actually wrong instead of the ones that happen to be
looked at first. Two thresholds are reported per slice:

  heavy  pixels off by more than a third of the range — wrong colour or a
         missing / displaced element
  soft   pixels off slightly — antialiasing and font rasterisation, which
         cannot be driven to zero and should be ignored unless it dominates

Usage:
  python tools/audit.py home.png Accueil-p1 [sliceHeight] [scale]

At a presentation scale below 1, the build's live canvas is centred inside
full-bleed bands. The optional scale compares that centred canvas with the comp
resampled to the same width, so intentional zoom is not counted as a defect:

  python tools/audit.py home-90.png Accueil-p1 50 0.9
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"

HEAVY = 85
SOFT = 24

# Named landmarks so a slice can be reported in the page's own terms.
BANDS = [
    ("inst bar", 0, 127),
    ("nav bar", 127, 277),
    ("hero", 277, 1330),
    ("chiffres", 1330, 2175),
    ("six projets", 2175, 3040),
    ("map", 3040, 4057),
    ("streams", 4057, 6010),
    ("stories", 6010, 7180),
    ("gap", 7180, 7353),
    ("publications", 7353, 8600),
    ("newsletter", 8600, 9480),
    ("footer", 9480, 10344),
]


def band_of(y: int) -> str:
    for name, top, bottom in BANDS:
        if top <= y < bottom:
            return name
    return "?"


def main() -> None:
    shot_name, tag = sys.argv[1], sys.argv[2]
    slice_h = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    scale = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0

    build_image = Image.open(OUT / "shots" / shot_name).convert("RGB")
    design_image = Image.open(OUT / "renders" / f"{tag}.png").convert("RGB")

    if scale != 1:
        width = round(design_image.width * scale)
        height = round(design_image.height * scale)
        design_image = design_image.resize((width, height), Image.Resampling.LANCZOS)
        left = max(0, (build_image.width - width) // 2)
        build_image = build_image.crop((left, 0, left + width, build_image.height))

    build = np.asarray(build_image, dtype=np.int16)
    design = np.asarray(design_image, dtype=np.int16)

    height = min(build.shape[0], design.shape[0])
    delta = np.abs(build[:height] - design[:height]).max(axis=2)

    rows = []
    for top in range(0, height, slice_h):
        chunk = delta[top : top + slice_h]
        rows.append(
            (
                float((chunk > HEAVY).mean() * 100),
                float((chunk > SOFT).mean() * 100),
                top,
                min(top + slice_h, height),
            )
        )

    print(f"{'heavy%':>7}{'soft%':>7}   y range            band")
    for heavy, soft, top, bottom in sorted(rows, reverse=True)[:24]:
        design_top = round(top / scale)
        print(f"{heavy:>7.2f}{soft:>7.2f}   {top:>6}-{bottom:<6}      {band_of(design_top)}")

    print(f"\n{'band':<14}{'heavy%':>8}{'soft%':>8}")
    for name, top, bottom in BANDS:
        top = round(top * scale)
        bottom = round(bottom * scale)
        bottom = min(bottom, height)
        if top >= bottom:
            continue
        chunk = delta[top:bottom]
        print(
            f"{name:<14}{(chunk > HEAVY).mean() * 100:>8.2f}"
            f"{(chunk > SOFT).mean() * 100:>8.2f}"
        )

    print(f"\noverall heavy {(delta > HEAVY).mean() * 100:.2f}%  soft {(delta > SOFT).mean() * 100:.2f}%")


if __name__ == "__main__":
    main()
