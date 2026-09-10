"""Build compact visual contact sheets from source PDFs and audit screenshots.

The full route screenshots are intentionally very tall. Contact sheets make an
A-to-Z visual pass practical while retaining the individual screenshots in
tools/out/site-audit for close inspection.
"""

from __future__ import annotations

from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "tools" / "out" / "site-audit"
OUT = ROOT / "tools" / "out" / "visual-audit"
DESIGNS = (
    ROOT.parent
    / "EU4Youth"
    / "UI Web Design-20260807T094637Z-1-001"
    / "UI Web Design"
)

CELL_W = 280
CELL_H = 330
LABEL_H = 34
COLS = 4
FONT = ImageFont.load_default()


def contain(image: Image.Image, width: int, height: int) -> Image.Image:
    copy = image.copy()
    copy.thumbnail((width, height), Image.Resampling.LANCZOS)
    return copy


def sheet(items: list[tuple[str, Image.Image]], name: str) -> None:
    rows = (len(items) + COLS - 1) // COLS
    canvas = Image.new("RGB", (COLS * CELL_W, rows * CELL_H), "white")
    draw = ImageDraw.Draw(canvas)

    for index, (label, image) in enumerate(items):
        column = index % COLS
        row = index // COLS
        x = column * CELL_W
        y = row * CELL_H
        thumb = contain(image.convert("RGB"), CELL_W - 16, CELL_H - LABEL_H - 16)
        px = x + (CELL_W - thumb.width) // 2
        py = y + LABEL_H + (CELL_H - LABEL_H - thumb.height) // 2
        canvas.paste(thumb, (px, py))
        draw.text((x + 8, y + 10), label[:42], fill="black", font=FONT)
        draw.rectangle(
            (x, y, x + CELL_W - 1, y + CELL_H - 1),
            outline=(215, 215, 215),
            width=1,
        )

    OUT.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT / name, optimize=True)
    print(f"{name}: {len(items)} items, {canvas.width}x{canvas.height}")


def route_screens(viewport: str) -> list[tuple[str, Image.Image]]:
    suffix = f"-{viewport}.png"
    items = []
    for path in sorted(AUDIT.glob(f"*{suffix}")):
        label = path.name.removesuffix(suffix).replace("--", "/")
        items.append((label, Image.open(path)))
    return items


def design_screens() -> list[tuple[str, Image.Image]]:
    items = []
    for path in sorted(DESIGNS.glob("*.pdf")):
        if path.name in {"BUTTON GUIDLINE.pdf", "COLOR GUIDLINE.pdf"}:
            continue
        document = pymupdf.open(path)
        for index, page in enumerate(document):
            pixmap = page.get_pixmap(matrix=pymupdf.Matrix(0.32, 0.32), alpha=False)
            image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
            items.append((f"{path.stem} · p{index + 1}", image))
        document.close()
    return items


def main() -> None:
    sheet(design_screens(), "source-designs.png")
    sheet(route_screens("desktop"), "routes-desktop.png")
    sheet(route_screens("mobile"), "routes-mobile.png")


if __name__ == "__main__":
    main()
