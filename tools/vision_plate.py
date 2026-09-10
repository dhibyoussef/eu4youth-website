"""Lift the vision band's background out of the comp, text and all removed.

Keying the watermark out of the right of the band and letting CSS paint the rest left a
seam: the comp's pink is a soft radial gradient, #d43170 at the edges and about #df3d70
towards the middle, so the plate's edge stepped against the flat CSS colour beside it.

So the whole band is rendered — but with the comp's own type taken out of the PDF before
anything is rasterised. Redacting each text line removes the glyphs and nothing else: the
inline image behind them, the watermark and the stitched disc are all still drawn by the
page, so the plate comes back as the comp's band minus its copy.

An earlier pass rendered the band first and then dissolved the glyph boxes by diffusing
the surrounding pink inwards. Every box picked up whatever it bordered, so each line of
copy left a pale rectangle behind — a page full of smears wherever the comp had set type.
Removing the text upstream leaves no boxes to fill and so no smears.

Usage: python tools/vision_plate.py
"""

from pathlib import Path

import pymupdf
from PIL import Image

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design' / 'a propos.pdf')
PUBLIC = Path(__file__).resolve().parents[1] / 'public' / 'img'

BAND = (3048, 3898)
# The rule under "Lire La suite" is drawn rather than typed, so redaction cannot find it.
# It is a thin white line on flat pink, so it is covered with the pink beside it.
RULE = (786, 3790, 996, 3804)


def main() -> None:
    doc = pymupdf.open(SRC)
    page = doc[0]

    lines = 0
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block['lines']:
            x0, y0, x1, y1 = line['bbox']
            if BAND[0] <= y0 and y1 <= BAND[1]:
                # A little margin, since a glyph's antialiasing reaches past its box.
                page.add_redact_annot(pymupdf.Rect(x0 - 2, y0 - 2, x1 + 2, y1 + 2))
                lines += 1

    # Sampled just left of the rule, in the flat part of the gradient it is drawn on.
    pink = page.get_pixmap(clip=pymupdf.Rect(770, 3790, 780, 3804), alpha=False)
    fill = tuple(c / 255 for c in pink.pixel(4, 6))
    page.add_redact_annot(pymupdf.Rect(*RULE), fill=fill)

    # Text only: the band's background is an image and the disc is line art, and both have
    # to survive the same call that drops the glyphs sitting on them.
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
                          text=pymupdf.PDF_REDACT_TEXT_REMOVE)
    print(f'{lines} lines of type redacted, rule filled with {pink.pixel(4, 6)}')

    pix = page.get_pixmap(matrix=pymupdf.Matrix(1, 1),
                          clip=pymupdf.Rect(0, BAND[0], 1920, BAND[1]), alpha=False)
    image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)

    # Suffixed: the smeared plate went out under the plain name and browsers hold it.
    path = PUBLIC / 'apropos-vision-plate-v2.webp'
    image.save(path, quality=90, method=6)
    print(f'{path.name}  {image.size}  {path.stat().st_size / 1024:.1f} KB')


if __name__ == '__main__':
    main()
