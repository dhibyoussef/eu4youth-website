"""Put one rect of the comp beside the same rect of the build, at 1:1.

tools/apropos_diff.py answers "is this band the right height" and nothing finer: its pairs are
resampled to fit on screen, and at that size a name 6px out of place, a rule a third of a pixel
thin or a plate 38px too high all look correct. This crops both at full size instead, so what
comes out is what a reader would actually see.

Coordinates are the comp's own, off the PDF. The build's copy of the rect is the same x and the
same height, shifted down by however far that band's seam has drifted — bands above it are within
a pixel each but the drift accumulates, and it is recorded per band by the shoot script.

Usage: python tools/zoom.py BAND X0 Y0 X1 Y1 [PAGE] [--side]

    python tools/zoom.py territoires 960 7080 1900 7300
    python tools/zoom.py partenaires 0 11000 1920 11200 1 --side
"""

import sys
from pathlib import Path

import pymupdf
from PIL import Image

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design')
WORK = Path.home() / 'AppData' / 'Local' / 'Temp' / 'eu4youth-extract' / 'apropos'
OUT = Path(__file__).resolve().parent / 'out'


def seams() -> tuple[dict[str, int], float]:
    """Where each band landed in the build, and the zoom it was shot at."""
    marks = WORK / 'offsets.txt'
    if not marks.exists():
        raise SystemExit(f'no offsets at {marks} — run tools/apropos_shoot.mjs first')

    tops, scale = {}, 1.0
    for line in marks.read_text(encoding='utf-8').splitlines():
        name, top, _ = line.split()
        if name == 'scale':
            scale = float(top)
        else:
            tops[name] = int(top)
    return tops, scale


def main() -> None:
    if len(sys.argv) < 6:
        raise SystemExit(__doc__)

    band = sys.argv[1]
    x0, y0, x1, y1 = (float(v) for v in sys.argv[2:6])
    rest = sys.argv[6:]
    side = '--side' in rest
    page_no = int(next((v for v in rest if not v.startswith('--')), 1))

    tops, scale = seams()
    if band not in tops:
        raise SystemExit(f'unknown band {band!r}; have {", ".join(tops)}')

    # The comp's seam for this band, so the drift between the two can be worked out. Kept in
    # step with apropos_diff.BANDS by importing it rather than repeating the numbers.
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from apropos_diff import BANDS  # noqa: PLC0415
    comp_top = next(top for name, top, _ in BANDS if name == band)

    doc = pymupdf.open(SRC / 'a propos.pdf')
    pix = doc[page_no - 1].get_pixmap(matrix=pymupdf.Matrix(scale, scale),
                                      clip=pymupdf.Rect(x0, y0, x1, y1), alpha=False)
    left = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)

    shot = Image.open(WORK / 'page.png').convert('RGB')
    drift = tops[band] - comp_top * scale
    box = (round(x0 * scale), round(y0 * scale + drift),
           round(x1 * scale), round(y1 * scale + drift))
    right = shot.crop(box)

    gap = 10
    if side:
        canvas = Image.new('RGB', (left.width + right.width + gap * 3,
                                   max(left.height, right.height) + gap * 2), (24, 24, 28))
        canvas.paste(left, (gap, gap))
        canvas.paste(right, (left.width + gap * 2, gap))
    else:
        canvas = Image.new('RGB', (max(left.width, right.width) + gap * 2,
                                   left.height + right.height + gap * 3), (24, 24, 28))
        canvas.paste(left, (gap, gap))
        canvas.paste(right, (gap, left.height + gap * 2))

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f'zoom-{band}.png'
    canvas.save(path)
    print(f'comp y {y0:.0f}  build y {y0 * scale + drift:.0f}  (drift {drift:+.0f})  -> {path}')


if __name__ == '__main__':
    main()
