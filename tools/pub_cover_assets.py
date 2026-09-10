"""Convert supplied publication covers from the design library into web assets.

The design library ships document covers as full-size PNGs; the catalogue cards
only ever display them a few hundred pixels wide, so each one is downscaled and
re-encoded as WebP next to the covers rendered from the PDF corpus.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = (
    ROOT.parent
    / "EU4Youth"
    / "UI Web Design-20260807T094637Z-1-001"
    / "UI Web Design"
    / "images"
)
COVERS = ROOT / "public" / "img" / "pub-covers"

# source file -> published cover asset
SOURCES = {
    "25.png": "fe3ila-capitalisation-forums-jeunes.webp",
}

TARGET_WIDTH = 900


def main() -> None:
    COVERS.mkdir(parents=True, exist_ok=True)
    for source, target in SOURCES.items():
        image = Image.open(LIBRARY / source).convert("RGB")
        if image.width > TARGET_WIDTH:
            height = round(image.height * TARGET_WIDTH / image.width)
            image = image.resize((TARGET_WIDTH, height), Image.LANCZOS)
        destination = COVERS / target
        image.save(destination, "WEBP", quality=84, method=6)
        print(
            f"{source} -> {destination.relative_to(ROOT)}"
            f" ({image.width}x{image.height}, {destination.stat().st_size // 1024} KB)"
        )


if __name__ == "__main__":
    main()
