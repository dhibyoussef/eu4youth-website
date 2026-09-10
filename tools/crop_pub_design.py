"""Crop the rendered Publications design page into the regions worth matching:
the hero band, one resource card, and the toolbar/filter block."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parents[1] / "_extract" / "pub-design"
SCALE = 96 / 72  # render dpi vs PDF points

REGIONS = {
    "hero.png": (0, 140, 1920, 1300),
    "toolbar.png": (0, 1290, 1920, 1760),
    "card.png": (120, 1740, 700, 2560),
    "cards-row.png": (120, 1740, 1800, 2600),
}


def main() -> None:
    page = Image.open(OUT / "page1.png")
    for name, (x0, y0, x1, y1) in REGIONS.items():
        box = tuple(round(value * SCALE) for value in (x0, y0, x1, y1))
        crop = page.crop(box)
        crop.save(OUT / name)
        print(f"{name}: {crop.width}x{crop.height}")


if __name__ == "__main__":
    main()
