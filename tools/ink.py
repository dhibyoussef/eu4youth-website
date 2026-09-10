"""Where ink falls in a window of the a-propos comp, against the build's own.

tools/zoom.py shows the two side by side, which settles whether something is wrong; this settles
by how much and in which direction. Both sides are read in the comp's coordinates and the build
is looked up through its band's seam drift, the same as zoom.py, so the numbers can be used as
offsets directly.

Ink is anything far enough from the window's own dominant colour to be drawn on top of it, which
works on the orange and blue bands as well as on white.

With --scan it instead walks straight down the middle of the window and lists every colour it
changes to on the way, comp beside build. That is the reliable way to find an edge: an ink box
only reports one, and it reports the window's own border instead when the drawing fills it.

Usage: python tools/ink.py BAND X0 Y0 X1 Y1 [PAGE] [--scan]

    python tools/ink.py territoires 990 7130 1800 7180
    python tools/ink.py territoires 1200 7060 1210 7140 --scan
"""

import sys
from pathlib import Path

import numpy as np
import pymupdf
from PIL import Image

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design')
WORK = Path.home() / 'AppData' / 'Local' / 'Temp' / 'eu4youth-extract' / 'apropos'


def ground(window: np.ndarray) -> np.ndarray:
    """The window's most common colour, which whatever is drawn on it is measured against."""
    flat = window.reshape(-1, 3).astype(np.int32)
    keys = flat[:, 0] * 65536 + flat[:, 1] * 256 + flat[:, 2]
    common = np.bincount(keys).argmax()
    return np.array([common // 65536, common // 256 % 256, common % 256], dtype=np.int16)


def box(window: np.ndarray, tolerance: int) -> tuple[int, int, int, int] | None:
    ink = np.abs(window - ground(window)).max(axis=2) > tolerance
    rows = np.flatnonzero(ink.any(axis=1))
    cols = np.flatnonzero(ink.any(axis=0))
    if not rows.size or not cols.size:
        return None
    return int(cols[0]), int(rows[0]), int(cols[-1] - cols[0] + 1), int(rows[-1] - rows[0] + 1)


def main() -> None:
    if len(sys.argv) < 6:
        raise SystemExit(__doc__)

    band = sys.argv[1]
    x0, y0, x1, y1 = (int(v) for v in sys.argv[2:6])
    rest = sys.argv[6:]
    scan = '--scan' in rest
    page_no = int(next((v for v in rest if not v.startswith('--')), 1))

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from apropos_diff import BANDS  # noqa: PLC0415
    comp_top = next(top for name, top, _ in BANDS if name == band)

    tops, scale = {}, 1.0
    for line in (WORK / 'offsets.txt').read_text(encoding='utf-8').splitlines():
        name, top, _ = line.split()
        if name == 'scale':
            scale = float(top)
        else:
            tops[name] = int(top)
    drift = tops[band] - comp_top * scale

    pix = pymupdf.open(SRC / 'a propos.pdf')[page_no - 1].get_pixmap(
        matrix=pymupdf.Matrix(scale, scale), clip=pymupdf.Rect(x0, y0, x1, y1), alpha=False)
    comp = np.asarray(Image.frombytes('RGB', (pix.width, pix.height), pix.samples),
                      dtype=np.int16)

    shot = Image.open(WORK / 'page.png').convert('RGB')
    build = np.asarray(shot.crop((round(x0 * scale), round(y0 * scale + drift),
                                 round(x1 * scale), round(y1 * scale + drift))), dtype=np.int16)

    print(f'window  comp x {x0} y {y0}  {x1 - x0}x{y1 - y0}   build y {y0 + drift / scale:.0f}')

    if scan:
        for label, window in (('comp ', comp), ('build', build)):
            column = window[:, window.shape[1] // 2]
            runs = []
            for row, pixel in enumerate(column):
                if not runs or np.abs(pixel - runs[-1][1]).max() > 24:
                    runs.append((row, pixel))
            print(f'  {label}: ' + '  '.join(
                f'{y0 + row / scale:.0f} #{r:02x}{g:02x}{b:02x}' for row, (r, g, b) in runs))
        return

    found = {}
    for label, window in (('comp ', comp), ('build', build)):
        got = box(window, 40)
        found[label.strip()] = got
        if got is None:
            print(f'  {label}: no ink over {ground(window)}')
        else:
            print(f'  {label}: x {x0 + got[0] / scale:7.1f}  y {y0 + got[1] / scale:8.1f}'
                  f'  w {got[2] / scale:6.1f}  h {got[3] / scale:6.1f}')

    a, b = found['comp'], found['build']
    if a and b:
        print(f'  build is  x {(b[0] - a[0]) / scale:+.1f}  y {(b[1] - a[1]) / scale:+.1f}'
              f'  w {(b[2] - a[2]) / scale:+.1f}  h {(b[3] - a[3]) / scale:+.1f}  off the comp')


if __name__ == '__main__':
    main()
