"""Extract the comp's cut-out photographs with their transparency intact.

The bands that were served as flattened crops place their photography against the
copy, so once a band reflows to one narrow column the photograph lands underneath
the heading. Those bands now paint their own colour and drop the crop, which leaves
them as flat blocks — correct and readable, but stripped of the design.

The photographs are in the PDF as their own images, and the cut-out ones carry a
soft mask, so they can be placed over any colour. Copies pasted through a
screenshot lose that mask and arrive on opaque white, which is unusable on pink or
teal, so they are taken from the file itself.

Usage: python tools/cutouts.py
"""

from pathlib import Path

import pymupdf

SRC = Path(
    r"C:\Users\youss\OneDrive\Attachments\Desktop\EU4Youth"
    r"\UI Web Design-20260807T094637Z-1-001\UI Web Design"
)
PUBLIC = Path(__file__).resolve().parents[1] / "public/img"

# xref -> output name, identified in tools/places.py by luminance signature against
# the labelled source files.
# WebP rather than PNG: these are photographs with an alpha channel, and PNG has to
# store the colour losslessly, which costs around 800 KB each for artwork that is
# decorative. WebP keeps the alpha and lands under a tenth of that.
WANTED = {
    28555: "cut-femme-saut.webp",
    28556: "cut-pile-livres.webp",
}

# The comp places these far larger than a phone ever shows them. 700px still covers
# a 3x screen at the size they are used here.
MAX_WIDTH = 700
QUALITY = 82


def main() -> None:
    doc = pymupdf.open(SRC / "Accueil.pdf")
    PUBLIC.mkdir(parents=True, exist_ok=True)

    for xref, name in WANTED.items():
        info = doc.extract_image(xref)
        pixmap = pymupdf.Pixmap(doc, xref)

        mask = info.get("smask", 0)
        if mask:
            # Combining the image with its soft mask is what makes the background
            # transparent rather than white.
            pixmap = pymupdf.Pixmap(pixmap, pymupdf.Pixmap(doc, mask))
        else:
            print(f"{name}: no soft mask on xref {xref}, so it stays opaque")

        from PIL import Image
        import numpy as np

        target = PUBLIC / name
        scratch = target.with_suffix(".tmp.png")
        pixmap.save(scratch)

        # Resampled after saving rather than on the pixmap, so the alpha channel
        # goes through the same filter as the colour.
        image = Image.open(scratch).convert("RGBA")
        if image.width > MAX_WIDTH:
            height = round(image.height * MAX_WIDTH / image.width)
            image = image.resize((MAX_WIDTH, height), Image.LANCZOS)
        image.save(target, quality=QUALITY, method=6)
        scratch.unlink()

        transparent = float((np.asarray(image)[..., 3] < 8).mean()) * 100
        print(
            f"{name:<22} {image.width}x{image.height}  "
            f"{target.stat().st_size / 1024:.0f} KB  "
            f"{transparent:.0f}% transparent"
        )


if __name__ == "__main__":
    main()
