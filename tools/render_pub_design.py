"""Render the Publications design PDF so its intended composition can be compared
against the built page, and report where raster images sit on each page."""

from __future__ import annotations

from pathlib import Path

import fitz

DESIGN = Path(
    r"C:\Users\youss\OneDrive\Attachments\Desktop\fi2t-live-editor"
    r"\EU4Youth\UI Web Design-20260807T094637Z-1-001\UI Web Design"
    r"\Page Publications & Ressources.pdf"
)
OUT = Path(__file__).resolve().parents[1] / "_extract" / "pub-design"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(DESIGN)
    for number, page in enumerate(doc, start=1):
        rect = page.rect
        print(f"page {number}: {rect.width:.0f}x{rect.height:.0f}pt")
        pix = page.get_pixmap(dpi=96)
        target = OUT / f"page{number}.png"
        pix.save(target)
        print(f"  -> {target.name} ({pix.width}x{pix.height})")
        for info in page.get_image_info(xrefs=True):
            box = info["bbox"]
            print(
                f"  image xref={info['xref']} {info['width']}x{info['height']}"
                f" at ({box[0]:.0f},{box[1]:.0f})-({box[2]:.0f},{box[3]:.0f})"
            )


if __name__ == "__main__":
    main()
