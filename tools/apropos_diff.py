"""Put each band of the built a-propos page beside the same band of the comp.

Reading a full-page screenshot against a 9800px PDF proves nothing: at any size that fits
on screen, both are illegible, and the differences that matter — a wrong weight, a band
that is 40px too tall, a title that broke to two lines — are exactly the ones that vanish.
So the comp is rendered at the build's own width and cut at the same seams, and the pairs
are written out one band at a time.

Run tools/apropos_shoot.mjs first; it leaves the screenshot where this expects it.

Usage: python tools/apropos_diff.py
"""

from pathlib import Path

import pymupdf
from PIL import Image

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design')
WORK = Path.home() / 'AppData' / 'Local' / 'Temp' / 'eu4youth-extract'
SHOT = WORK / 'apropos' / 'page.png'
OUT = WORK / 'apropos'

# The comp's seams, in its own 1920-wide coordinates, read off its left edge by
# tools/seams.py rather than estimated: partenaires and avenir were both short here, which
# made this report say the build's avenir band was 143px too tall when it is in fact 122px
# too short. Names match the page's sections. Hero starts at the nav's bottom, not the page's
# top, because the two strips above it are the site header rather than part of the band.
BANDS = [
    ('hero', 262, 1331),
    ('pourquoi', 1331, 3048),
    ('vision', 3048, 3898),
    ('objectifs', 3898, 5281),
    ('comment', 5281, 6175),
    ('projets', 6175, 6966),
    ('territoires', 6966, 8565),
    ('impact', 8565, 9792),
    ('partenaires', 9792, 11726),
    ('avenir', 11726, 13053),
]


def comp_band(page, y0: int, y1: int, width: int) -> Image.Image:
    """The comp between two seams, resampled to the width the build is shot at."""
    scale = width / 1920
    pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale),
                          clip=pymupdf.Rect(0, y0, 1920, y1), alpha=False)
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)


def main() -> None:
    if not SHOT.exists():
        raise SystemExit(f'no screenshot at {SHOT} — run tools/apropos_shoot.mjs first')

    shot = Image.open(SHOT).convert('RGB')
    page = pymupdf.open(SRC / 'a propos.pdf')[0]

    # The build is a flow layout, so its bands are not at the comp's offsets. The shoot
    # script writes where each one landed; without that file the comp side still helps,
    # so a missing offsets file is not fatal.
    offsets = {}
    # --zoom scales every rem, so the comp has to be resampled by the same factor before a
    # height difference means anything; the shoot script records what it was.
    scale = 1.0
    marks = OUT / 'offsets.txt'
    if marks.exists():
        for line in marks.read_text(encoding='utf-8').splitlines():
            name, top, bottom = line.split()
            if name == 'scale':
                scale = float(top)
                continue
            offsets[name] = (int(top), int(bottom))

    for name, y0, y1 in BANDS:
        left = comp_band(page, y0, y1, round(shot.width * scale))

        if name in offsets:
            top, bottom = offsets[name]
            right = shot.crop((0, top, shot.width, min(bottom, shot.height)))
        else:
            continue

        # Stacked rather than beside each other: the eye compares vertical positions far
        # better one above the other, and the comp is centred because the build's own
        # content is centred in the same canvas within a full-width band.
        gap = 12
        canvas = Image.new('RGB', (shot.width, left.height + right.height + gap * 3),
                           (24, 24, 28))
        canvas.paste(left, ((shot.width - left.width) // 2, gap))
        canvas.paste(right, (0, left.height + gap * 2))
        path = OUT / f'pair-{name}.png'
        canvas.save(path)
        print(f'{name:14s} comp {left.height:5d}px   build {right.height:5d}px   '
              f'{right.height - left.height:+5d}   {path.name}')


if __name__ == '__main__':
    main()
