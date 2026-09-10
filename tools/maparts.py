"""Cut the map band's line drawing out of the comp, and measure its dashed ring.

The band is flat orange with a road drawing and pins over it, plus a blue disc at
the top right that straddles the band's white strip and its orange block. Serving
the whole band as one picture is what put live text and a live button on top of a
photograph; instead CSS draws the orange and the disc, and only the drawing is an
asset — keyed to transparent so it composites onto whatever colour CSS paints.

Usage: python tools/maparts.py
"""

from pathlib import Path

import numpy as np
import pymupdf
from PIL import Image

OUT = Path.home() / 'AppData/Local/Temp/eu4youth-extract'
PUBLIC = Path(__file__).resolve().parents[1] / 'public/img'
PDF = (Path(__file__).resolve().parents[2]
       / 'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design/Accueil.pdf')

ORANGE = np.array([241, 168, 72])   # as the band rasterises, not as it is declared
DISC = (1901, 3240, 157)            # centre x, centre y, radius
RING_RADIUS = 140

# The comp places the drawing from y 3250 but clips it to the orange block, whose
# top edge is 3272.5 — the white strip above carries nothing but the disc. Cutting
# from the block's edge rather than the drawing's keeps ink off the white.
ART = (762, 3273, 1920, 4057)       # x0, y0, x1, y1
BAND_TOP = 3040


def measure_ring(comp: np.ndarray) -> None:
    cx, cy, _ = DISC
    dash = np.array([245, 171, 73])
    angles = np.linspace(0, 2 * np.pi, 4000, endpoint=False)
    xs = np.round(cx + RING_RADIUS * np.cos(angles)).astype(int)
    ys = np.round(cy + RING_RADIUS * np.sin(angles)).astype(int)
    inside = (xs >= 0) & (xs < comp.shape[1])
    hit = np.zeros(len(angles), bool)
    hit[inside] = np.abs(comp[ys[inside], xs[inside]] - dash).max(axis=1) < 40

    # Run lengths around the visible part of the ring, converted to arc pixels.
    step = 2 * np.pi * RING_RADIUS / len(angles)
    runs, current, value = [], 0, hit[0]
    for flag in hit:
        if flag == value:
            current += 1
        else:
            runs.append((value, current * step))
            value, current = flag, 1
    runs.append((value, current * step))
    dashes = [length for flag, length in runs if flag and length > 2]
    gaps = [length for flag, length in runs if not flag and 2 < length < 60]
    if dashes and gaps:
        print(f'ring: {len(dashes)} dashes, median dash {np.median(dashes):.1f}px, '
              f'median gap {np.median(gaps):.1f}px  '
              f'-> period {np.median(dashes) + np.median(gaps):.1f}px')
    else:
        print('ring: could not resolve the dash rhythm')


def render_without_text() -> np.ndarray:
    """Page 1 at 1:1, with every word removed and all line art kept.

    The full-page render carries the comp's typesetting, so keying the drawing out of
    it baked the headline and the ends of the body lines into the asset. At 1920 those
    printed words sat close enough behind the live ones to pass; at any other width
    the picture and the live text scale by different rules and the printed copy walks
    out from under its counterpart. Redacting the words first means there is only ever
    one copy of any word on the page — the live one.
    """
    doc = pymupdf.open(PDF)
    page = doc[0]
    for x0, y0, x1, y1, *_ in page.get_text('words'):
        # fill=None leaves the area alone; the default would paint a white box.
        page.add_redact_annot(pymupdf.Rect(x0, y0, x1, y1), fill=None)
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
    return np.frombuffer(pix.samples, np.uint8).reshape(
        pix.height, pix.width, 3).astype(np.int16)


def main() -> None:
    comp = render_without_text()
    measure_ring(comp)

    x0, y0, x1, y1 = ART
    art = comp[y0:y1, x0:x1].astype(np.float32)

    # Alpha from distance to the band's orange. The drawing is white roads, cream
    # road fills and blue pins, all far from the background, so a soft ramp keeps
    # the antialiased edges without eating any of the artwork.
    distance = np.abs(art - ORANGE).max(axis=2)
    alpha = np.clip((distance - 6) / 18, 0, 1)

    # Unmultiply toward the orange so edge pixels do not carry it as a halo.
    with np.errstate(invalid='ignore', divide='ignore'):
        colour = ORANGE + (art - ORANGE) / np.maximum(alpha, 1e-3)[..., None]
    colour = np.clip(np.where(alpha[..., None] > 0, colour, ORANGE), 0, 255)

    # Punch out the disc: CSS draws it, so the asset must not carry a second copy.
    cx, cy, radius = DISC
    yy, xx = np.mgrid[y0:y1, x0:x1]
    inside_disc = (xx - cx) ** 2 + (yy - cy) ** 2 <= (radius + 2) ** 2
    alpha[inside_disc] = 0

    rgba = np.dstack([colour, alpha * 255]).astype(np.uint8)
    image = Image.fromarray(rgba, 'RGBA')
    PUBLIC.mkdir(parents=True, exist_ok=True)
    path = PUBLIC / 'map-art.png'
    image.save(path, optimize=True)

    print(f'{path.name}  {image.width}x{image.height}  '
          f'{path.stat().st_size / 1024:.0f} KB')
    print(f'  place at x {x0}, y {y0 - BAND_TOP} inside the band, '
          f'{x1 - x0} x {y1 - y0}')
    print(f'  {(alpha > 0).mean() * 100:.1f}% of it carries any ink')


if __name__ == '__main__':
    main()
