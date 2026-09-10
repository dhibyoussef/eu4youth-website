"""Extract corrected project-banner strip + hero art from projet banner.pdf."""

from __future__ import annotations

from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = (
    ROOT.parent
    / "EU4Youth"
    / "projet banner.pdf"
)
PUBLIC = ROOT / "public" / "img" / "project-banners"
OUT = ROOT / "tools" / "out" / "banner-pages"

PAGES = [
    "jeuness",
    "fe3ila",
    "swafy",
    "maghroumin",
    "go4youth",
    "irada4youth",
]


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(SRC)

    for index, slug in enumerate(PAGES):
        page = doc[index]
        pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0), alpha=False)
        full = OUT / f"{slug}-full.png"
        pix.save(full)
        img = Image.open(full).convert("RGB")
        w, h = img.size

        # Measured from the rendered banner comps:
        # 0.000-0.115 institutional chrome, 0.115-0.248 primary nav,
        # 0.248-0.288 thin colour accent, 0.288-0.382 white partner strip,
        # 0.382+ project colour hero field.
        strip = img.crop((0, int(h * 0.288), w, int(h * 0.382)))
        hero = img.crop((0, int(h * 0.382), w, int(h * 0.86)))

        # Keep only the partner marks for the live strip — crop out residual
        # chrome by focusing on the white band content area.
        strip_path = PUBLIC / f"{slug}-strip.webp"
        hero_path = PUBLIC / f"{slug}-hero.webp"
        strip.save(strip_path, "WEBP", quality=84, method=6)
        hero.save(hero_path, "WEBP", quality=80, method=6)
        strip.save(PUBLIC / f"{slug}-strip.png")
        hero.save(PUBLIC / f"{slug}-hero.png")
        print(slug, f"strip={strip_path.stat().st_size // 1024}KB", f"hero={hero_path.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
