"""Strip white backgrounds from project colour logos for the footer strip.

Usage: python tools/prepare_footer_logos.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

from footer_assets import key_from_edges

IMG = Path(__file__).resolve().parents[1] / "public" / "img"

SLUGS = (
    "irada4youth",
    "swafy",
    "jeuness",
    "fe3ila",
    "maghroumin",
    "go4youth",
)


def main() -> None:
    for slug in SLUGS:
        source = IMG / f"logo-{slug}.png"
        if not source.exists():
            print(f"skip missing {source.name}")
            continue
        img = key_from_edges(Image.open(source), 48)
        box = img.getbbox()
        if box:
            img = img.crop(box)
        target = IMG / f"logo-{slug}-footer.webp"
        img.save(target, "WEBP", quality=95, method=6)
        print(f"{source.name} -> {target.name}  {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    main()
