"""Extract ground truth from the EU4Youth UI Web Design PDFs.

Produces, per PDF page:
  renders/<pdf>-p<N>.png            full page render
  slices/<pdf>-p<N>-b<M>.png        vertical bands (tall pages stay readable)
  geometry/<pdf>-p<N>.json          text spans + vector rects with exact bbox/color
  assets/<pdf>-p<N>-img<K>.png      embedded raster images (real photos / logos)

Usage:  python tools/extract_design.py [pdf-name-substring]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pymupdf

SRC = Path(
    r"C:\Users\youss\OneDrive\Attachments\Desktop\fi2t-live-editor"
    r"\EU4Youth\UI Web Design-20260807T094637Z-1-001\UI Web Design"
)
OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"

BAND_HEIGHT = 1400  # px per inspection slice
RENDER_SCALE = 1.0  # PDF units are already ~1920 wide == CSS px


def to_hex(value: int | None) -> str | None:
    if value is None:
        return None
    return f"#{value & 0xFFFFFF:06X}"


def dump_geometry(page: pymupdf.Page) -> dict:
    spans = []
    text = page.get_text("dict")
    for block in text.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            wdir = line.get("dir", (1, 0))
            for span in line.get("spans", []):
                content = span.get("text", "")
                if not content.strip():
                    continue
                x0, y0, x1, y1 = span["bbox"]
                spans.append(
                    {
                        "text": content,
                        "x": round(x0, 1),
                        "y": round(y0, 1),
                        "w": round(x1 - x0, 1),
                        "h": round(y1 - y0, 1),
                        "font": span.get("font"),
                        "size": round(span.get("size", 0), 2),
                        "color": to_hex(span.get("color")),
                        "vertical": wdir != (1, 0),
                    }
                )

    rects = []
    for drawing in page.get_drawings():
        bbox = drawing.get("rect")
        if bbox is None:
            continue
        width = bbox.x1 - bbox.x0
        height = bbox.y1 - bbox.y0
        if width < 2 or height < 2:
            continue
        fill = drawing.get("fill")
        stroke = drawing.get("color")
        rects.append(
            {
                "x": round(bbox.x0, 1),
                "y": round(bbox.y0, 1),
                "w": round(width, 1),
                "h": round(height, 1),
                "fill": (
                    "#%02X%02X%02X" % tuple(round(c * 255) for c in fill)
                    if fill
                    else None
                ),
                "stroke": (
                    "#%02X%02X%02X" % tuple(round(c * 255) for c in stroke)
                    if stroke
                    else None
                ),
                "area": round(width * height),
            }
        )
    rects.sort(key=lambda r: -r["area"])

    images = [
        {
            "x": round(info["bbox"][0], 1),
            "y": round(info["bbox"][1], 1),
            "w": round(info["bbox"][2] - info["bbox"][0], 1),
            "h": round(info["bbox"][3] - info["bbox"][1], 1),
            "xref": info.get("xref"),
        }
        for info in page.get_image_info(xrefs=True)
    ]

    return {
        "width": round(page.rect.width, 1),
        "height": round(page.rect.height, 1),
        "spans": spans,
        "rects": rects,
        "images": images,
    }


def main() -> None:
    needle = sys.argv[1].lower() if len(sys.argv) > 1 else None

    for folder in ("renders", "slices", "geometry", "assets"):
        (OUT / folder).mkdir(parents=True, exist_ok=True)

    pdfs = sorted(SRC.glob("*.pdf"))
    if needle:
        pdfs = [p for p in pdfs if needle in p.stem.lower()]

    for pdf in pdfs:
        stem = pdf.stem.replace(" ", "-").replace("&", "and")
        doc = pymupdf.open(pdf)

        for index, page in enumerate(doc, start=1):
            tag = f"{stem}-p{index}"

            geometry = dump_geometry(page)
            (OUT / "geometry" / f"{tag}.json").write_text(
                json.dumps(geometry, indent=1, ensure_ascii=False), encoding="utf-8"
            )

            pix = page.get_pixmap(
                matrix=pymupdf.Matrix(RENDER_SCALE, RENDER_SCALE), alpha=False
            )
            pix.save(OUT / "renders" / f"{tag}.png")

            bands = max(1, -(-pix.height // BAND_HEIGHT))
            if bands > 1:
                for band in range(bands):
                    top = band * BAND_HEIGHT
                    clip = pymupdf.Rect(
                        0,
                        top / RENDER_SCALE,
                        page.rect.width,
                        min(top + BAND_HEIGHT, pix.height) / RENDER_SCALE,
                    )
                    band_pix = page.get_pixmap(
                        matrix=pymupdf.Matrix(RENDER_SCALE, RENDER_SCALE),
                        clip=clip,
                        alpha=False,
                    )
                    band_pix.save(OUT / "slices" / f"{tag}-b{band + 1:02d}.png")

            seen: set[int] = set()
            for image in geometry["images"]:
                xref = image["xref"]
                if not xref or xref in seen:
                    continue
                seen.add(xref)
                try:
                    extracted = doc.extract_image(xref)
                except Exception:
                    continue
                if len(extracted["image"]) < 6000:
                    continue  # skip tiny decorative fragments
                path = (
                    OUT
                    / "assets"
                    / f"{tag}-x{xref}-{image['w']:.0f}x{image['h']:.0f}.{extracted['ext']}"
                )
                path.write_bytes(extracted["image"])

            print(
                f"{tag}: {geometry['width']:.0f}x{geometry['height']:.0f} "
                f"spans={len(geometry['spans'])} rects={len(geometry['rects'])} "
                f"imgs={len(geometry['images'])} bands={bands}"
            )

    print(f"\nOUT: {OUT}")


if __name__ == "__main__":
    main()
