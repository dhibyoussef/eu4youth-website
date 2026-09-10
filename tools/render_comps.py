"""Render every design PDF page to PNG so the build can be compared with it.

Pages come out at a fixed pixel width so a render and a screenshot of the same
band can be put side by side without either being rescaled by eye.

Usage: python tools/render_comps.py [width]
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

SOURCE = Path(
    r"C:\Users\youss\OneDrive\Attachments\Desktop\fi2t-live-editor"
    r"\EU4Youth\UI Web Design-20260807T094637Z-1-001\UI Web Design"
)
OUT = Path("tools/out/comp")

SLUGS = {
    "Accueil": "accueil",
    "a propos": "apropos",
    "Actualité": "actualites",
    "opportunités": "opportunites",
    "Page Publications & Ressources": "publications",
    "projet": "projet",
    "projet banner": "projet-banner",
    "carte v2": "carte",
    "Contact": "contact",
    "Glossaire": "glossaire",
    "BUTTON GUIDLINE": "buttons",
    "COLOR GUIDLINE": "colors",
}


def main() -> None:
    width = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
    OUT.mkdir(parents=True, exist_ok=True)

    for pdf in sorted(SOURCE.glob("*.pdf")):
        slug = SLUGS.get(pdf.stem, pdf.stem.lower().replace(" ", "-"))
        with pymupdf.open(pdf) as doc:
            for index, page in enumerate(doc, start=1):
                zoom = width / page.rect.width
                pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
                target = OUT / f"{slug}-p{index}.png"
                pix.save(target)
                print(f"{target}  {pix.width}x{pix.height}")


if __name__ == "__main__":
    main()
