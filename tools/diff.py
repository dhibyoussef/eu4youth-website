"""Compare a build screenshot against the design render, band by band.

Produces, per vertical band:
  compare/<name>-b<NN>.png   design on the left, build on the right
and an overlay where the two are blended so drift shows as ghosting:
  compare/<name>-overlay-b<NN>.png

Usage:
  python tools/diff.py home.png Accueil-p1 [bandHeight]
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"
COMPARE = OUT / "compare"

LABEL_H = 34


def label(image: Image.Image, text: str) -> Image.Image:
    canvas = Image.new("RGB", (image.width, image.height + LABEL_H), "#111111")
    canvas.paste(image, (0, LABEL_H))
    ImageDraw.Draw(canvas).text((10, 9), text, fill="#ffffff")
    return canvas


def main() -> None:
    shot_name = sys.argv[1]
    render_tag = sys.argv[2]
    band_h = int(sys.argv[3]) if len(sys.argv) > 3 else 1400

    shot = Image.open(OUT / "shots" / shot_name).convert("RGB")
    design = Image.open(OUT / "renders" / f"{render_tag}.png").convert("RGB")

    COMPARE.mkdir(parents=True, exist_ok=True)
    stem = Path(shot_name).stem

    print(f"design {design.width}x{design.height}   build {shot.width}x{shot.height}")
    if design.height != shot.height:
        print(f"!! height differs by {shot.height - design.height}px")

    height = max(design.height, shot.height)
    bands = -(-height // band_h)

    for index in range(bands):
        top = index * band_h
        bottom = min(top + band_h, height)
        box = (0, top, design.width, min(bottom, design.height))

        left = design.crop(box)
        right = shot.crop((0, top, shot.width, min(bottom, shot.height)))

        pair = Image.new("RGB", (left.width + right.width + 8, bottom - top + LABEL_H), "#111111")
        pair.paste(label(left, f"DESIGN  y={top}-{bottom}"), (0, 0))
        pair.paste(label(right, f"BUILD  y={top}-{bottom}"), (left.width + 8, 0))
        pair.save(COMPARE / f"{stem}-b{index + 1:02d}.png")

        if left.size == right.size:
            blend = Image.blend(left, right, 0.5)
            delta = ImageChops.difference(left, right).convert("L").point(
                lambda v: 255 if v > 40 else 0
            )
            overlay = blend.copy()
            overlay.paste(Image.new("RGB", left.size, "#ff0000"), mask=delta)
            overlay.save(COMPARE / f"{stem}-overlay-b{index + 1:02d}.png")

    print(f"-> {COMPARE}  ({bands} bands)")


if __name__ == "__main__":
    main()
