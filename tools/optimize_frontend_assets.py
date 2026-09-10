"""Frontend asset optimization from supplied sources.

1. Publication PDF page-1 covers -> public/img/pub-covers/*.webp
2. Home/catalogue photography -> sized WebP
3. Compress oversized public PDFs with PyMuPDF when Ghostscript is absent
4. Leave the unused Irada draft PDF out of the static build
"""

from __future__ import annotations

import shutil
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DOCS = PUBLIC / "docs"
IMG = PUBLIC / "img"
DESIGN_IMG = (
    ROOT.parent
    / "EU4Youth"
    / "UI Web Design-20260807T094637Z-1-001"
    / "UI Web Design"
    / "images"
)

PUB_COVERS = IMG / "pub-covers"
DRAFT_PDF = DOCS / "irada4youth" / "module-pilotage-changement-2024.pdf"

PHOTO_MAP = {
    "01_hero_amis_jetee.png": ("home-hero-v2.webp", 1920),
    "05_groupe_celebration_trophee.png": ("photo-celebration.webp", 1400),
    "07_sac_bouchons_recyclage.png": ("photo-recyclage.webp", 1400),
    "08_chevres_elevage.png": ("photo-elevage.webp", 1400),
    "06_jeune_peinture_murale.png": ("photo-graffiti-src.webp", 1400),
    "04_pile_de_livres.png": ("photo-livres.webp", 1400),
}

HOME_MAP = {
    "home-hero-v2.jpg": ("home-hero-v2.webp", 1920),
    "home-stories-v2.jpg": ("home-stories-v2.webp", 1600),
    "home-publications.jpg": ("home-publications.webp", 1600),
    "magic_edit#TUFIVDlJM0Z4SW8jMSMyZjA0MTE1MzY5NWNkZGM4N2Q4ZGM3ZGE5ZGQwMzNlOSMxOTExIyNUUkFOU0ZPUk1BVElPTl9SRVFVRVNU.png": (
        "map-art.webp",
        1600,
    ),
}


def save_webp(src: Path, dest: Path, max_width: int, quality: int = 78) -> None:
    img = Image.open(src).convert("RGB")
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, max(1, int(img.height * ratio))), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=quality, method=6)
    print(f"webp {dest.relative_to(ROOT)} {dest.stat().st_size // 1024}KB")


def export_pub_covers() -> None:
    PUB_COVERS.mkdir(parents=True, exist_ok=True)
    for pdf in sorted(DOCS.rglob("*.pdf")):
        if pdf.name.startswith("module-pilotage"):
            continue
        stem = pdf.stem
        dest = PUB_COVERS / f"{stem}.webp"
        doc = fitz.open(pdf)
        page = doc[0]
        # Aim for ~600px wide covers for catalogue cards.
        scale = 600 / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        tmp = PUB_COVERS / f"{stem}.png"
        pix.save(tmp)
        Image.open(tmp).convert("RGB").save(dest, "WEBP", quality=80, method=6)
        tmp.unlink(missing_ok=True)
        print(f"cover {dest.name} {dest.stat().st_size // 1024}KB")


def compress_pdfs() -> None:
    targets = [
        DOCS / "irada4youth" / "rapport-narratif-2023.pdf",
        DOCS / "go4youth" / "newsletter-11-avril-2026.pdf",
        DOCS / "go4youth" / "newsletter-10-decembre-2025.pdf",
        DOCS / "go4youth" / "newsletter-6-septembre-2024.pdf",
        DOCS / "go4youth" / "newsletter-2-juin-2023.pdf",
    ]
    for pdf in targets:
        if not pdf.exists():
            continue
        before = pdf.stat().st_size
        if before < 1_500_000:
            continue
        doc = fitz.open(pdf)
        tmp = pdf.with_suffix(".tmp.pdf")
        doc.save(
            tmp,
            garbage=4,
            deflate=True,
            clean=True,
            pretty=False,
        )
        doc.close()
        after = tmp.stat().st_size
        if after < before * 0.95:
            tmp.replace(pdf)
            print(f"pdf {pdf.name} {before // 1024}KB -> {after // 1024}KB")
        else:
            tmp.unlink(missing_ok=True)
            print(f"pdf {pdf.name} kept ({before // 1024}KB; no meaningful shrink)")


def drop_draft() -> None:
    if DRAFT_PDF.exists():
        archive = ROOT / "tools" / "out" / "excluded-docs"
        archive.mkdir(parents=True, exist_ok=True)
        dest = archive / DRAFT_PDF.name
        shutil.move(str(DRAFT_PDF), dest)
        print(f"moved draft {DRAFT_PDF.name} -> {dest.relative_to(ROOT)}")


def main() -> None:
    for src_name, (dest_name, width) in PHOTO_MAP.items():
        src = DESIGN_IMG / src_name
        if src.exists():
            save_webp(src, IMG / dest_name, width)

    for src_name, (dest_name, width) in HOME_MAP.items():
        src = IMG / src_name
        if src.exists():
            save_webp(src, IMG / dest_name, width, quality=76)

    export_pub_covers()
    compress_pdfs()
    drop_draft()


if __name__ == "__main__":
    main()
