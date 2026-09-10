"""Trim the hero-band sliver left at the bottom of each extracted partner strip.

extract_banner_assets.py cuts the strip a few pixels into the coloured hero band
below it, which renders as a stray rule under the partner logos. Rows are dropped
from the bottom (and top) while they are not predominantly white paper.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
STRIPS = sorted((ROOT / "public" / "img" / "project-banners").glob("*-strip.webp"))

WHITE = 236
MIN_WHITE_SHARE = 0.9


def white_share(img: Image.Image, y: int) -> float:
    row = img.crop((0, y, img.width, y + 1)).getdata()
    white = sum(1 for r, g, b in row if r >= WHITE and g >= WHITE and b >= WHITE)
    return white / img.width


def main() -> None:
    for path in STRIPS:
        img = Image.open(path).convert("RGB")
        top, bottom = 0, img.height

        while bottom > top + 1 and white_share(img, bottom - 1) < MIN_WHITE_SHARE:
            bottom -= 1
        while top < bottom - 1 and white_share(img, top) < MIN_WHITE_SHARE:
            top += 1

        if bottom - top == img.height:
            print(f"{path.name}: already clean ({img.width}x{img.height})")
            continue

        trimmed = img.crop((0, top, img.width, bottom))
        trimmed.save(path, "WEBP", quality=86, method=6)
        print(
            f"{path.name}: {img.height} -> {trimmed.height}px"
            f" (top {top}, bottom {img.height - bottom})"
        )


if __name__ == "__main__":
    main()
