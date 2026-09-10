"""Ad-hoc crop from a design PDF, for probing regions while building.

Usage:
  python tools/crop.py Accueil 1 1680 160 1920 245 [out.png] [--plate] [--scale 4]

Writes to the temp scratch folder unless the name ends in a public asset path.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

SRC = Path(
    r"C:\Users\youss\OneDrive\Attachments\Desktop\EU4Youth"
    r"\UI Web Design-20260807T094637Z-1-001\UI Web Design"
)
SCRATCH = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract" / "crops"


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]

    stem, page_no = args[0], int(args[1])
    x0, y0, x1, y1 = (float(v) for v in args[2:6])
    name = args[6] if len(args) > 6 else f"{stem}-{x0:.0f}_{y0:.0f}.png"
    scale = 4
    for flag in flags:
        if flag.startswith("--scale"):
            scale = int(flag.split("=")[1] if "=" in flag else 4)

    doc = pymupdf.open(SRC / f"{stem}.pdf")
    page = doc[page_no - 1]

    if "--plate" in flags:
        for block in page.get_text("dict").get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    if span.get("text", "").strip():
                        page.add_redact_annot(pymupdf.Rect(span["bbox"]) + (-1, -1, 1, 1))
        page.apply_redactions(
            images=pymupdf.PDF_REDACT_IMAGE_NONE,
            graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
            text=pymupdf.PDF_REDACT_TEXT_REMOVE,
        )

    SCRATCH.mkdir(parents=True, exist_ok=True)
    target = Path(name) if "/" in name or "\\" in name else SCRATCH / name

    pix = page.get_pixmap(
        matrix=pymupdf.Matrix(scale, scale),
        clip=pymupdf.Rect(x0, y0, x1, y1),
        alpha=not str(target).endswith(".jpg"),
    )
    pix.save(target, jpg_quality=88) if str(target).endswith(".jpg") else pix.save(target)
    print(f"{target}  {pix.width}x{pix.height}")


if __name__ == "__main__":
    main()
