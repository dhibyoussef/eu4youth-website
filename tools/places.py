"""Report where a comp places each of its embedded photographs.

The build had been painting whole bands as flattened crops of the comp with the
copy scrubbed out, then floating live text over them. That works until anything
live needs a background of its own: a button, or the white plate each project
logo uses to cover its watermark, lands on a JPEG whose white is 253 rather than
255 and reads as a box. The way out is to place the comp's own photographs as
real images and let CSS draw the flat colour behind them, which needs the
placement rectangle of every photo in design pixels.

Usage: python tools/places.py [Accueil] [page]
"""

import sys
from pathlib import Path

import fitz

DESIGN_WIDTH = 1920

DESIGN = Path(__file__).resolve().parents[2] / (
    'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design'
)

# Matched to the labelled source files by 32x32 luminance signature; every one
# scored ~0.00 against its twin and ~1.0 against the next best, so these are
# certain rather than guessed.
NAMES = {
    28523: 'hero-amis-jetee',
    28533: 'trophee',
    28535: 'peinture-murale',
    28536: 'recyclage',
    28537: 'chevres',
    28554: 'entretien-cv',
    28555: 'femme-saut',
    28556: 'pile-livres',
}


def main() -> None:
    stem = sys.argv[1] if len(sys.argv) > 1 else 'Accueil'
    index = int(sys.argv[2]) - 1 if len(sys.argv) > 2 else 0

    doc = fitz.open(DESIGN / f'{stem}.pdf')
    page = doc[index]
    scale = DESIGN_WIDTH / page.rect.width
    print(f'{stem} p{index + 1}: {page.rect.width:.1f}x{page.rect.height:.1f} pt'
          f'  ->  {DESIGN_WIDTH}x{page.rect.height * scale:.0f} design px')

    rows = []
    for info in page.get_image_info(xrefs=True):
        x0, y0, x1, y1 = (v * scale for v in info['bbox'])
        rows.append((y0, x0, x1 - x0, y1 - y0, info['xref'],
                     info['width'], info['height']))

    print(f'\n{"name":<18}{"x":>8}{"y":>9}{"w":>8}{"h":>8}   native      scale')
    for y0, x0, w, h, xref, nw, nh in sorted(rows):
        name = NAMES.get(xref, f'xref{xref}')
        # How much the comp shrinks the original tells us the resolution we can
        # afford to serve: anything above 2x placed size is wasted bytes.
        factor = nw / w if w else 0
        print(f'{name:<18}{x0:8.1f}{y0:9.1f}{w:8.1f}{h:8.1f}   {nw}x{nh}'
              f'   {factor:.2f}x')


if __name__ == '__main__':
    main()
