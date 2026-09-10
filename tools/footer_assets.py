"""Prepare the footer's two lockups so they can sit on the band's gradient.

Both ship as rectangles of the footer's flat blue with the artwork on top. Dropped onto the
band as they are they show as patches, because the band is a gradient and their blue is one
flat value. Keying has to be a flood fill from the edges rather than a colour match: the EU
flag's own field is nearly the same blue as the background, and a colour match would punch a
hole through the middle of the flag. A fill only reaches the background, because the flag's
white border encloses its field.

Usage: python tools/footer_assets.py
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

IMG = Path(__file__).resolve().parents[1] / 'public' / 'img'

# source, output, how far from the sampled corner still counts as background
JOBS = [
    ('footer-logo.png', 'footer-logo-v2.webp', 60),
    ('footer-flags.png', 'footer-flags-v2.webp', 60),
]

# The footer prints the six project logos in white, and their shape is carried partly by
# knockouts — the band's blue showing through the mark, as in Fe3il.a's three blocks and
# GO 4 YOUTH's box. Tinting the grey art white cannot reproduce that: the grey files carry
# that detail as a lighter tone rather than as transparency, so flattening them to one white
# turns three of the six into blobs. The plate holds the comp's own white version at twice
# design resolution, so it is the source. Boxes from tools/plate.py, in design px.
STRIP = ('home-footer.jpg', [
    ('irada4youth', 76, 758, 88, 42),
    ('swafy', 205, 742, 58, 64),
    ('jeuness', 302, 736, 75, 70),
    ('fe3ila', 424, 759, 97, 32),
    ('maghroumin', 582, 744, 81, 55),
    ('go4youth', 707, 757, 116, 26),
])


def key_from_edges(img: Image.Image, tol: int) -> Image.Image:
    """Flood the background to transparent, starting from every border pixel."""
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    base = px[0, 0][:3]

    def matches(p) -> bool:
        return sum(abs(a - b) for a, b in zip(p[:3], base)) <= tol

    seen = bytearray(w * h)
    queue: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        if not (0 <= x < w and 0 <= y < h):
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not matches(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return img


def white_on_blue(crop: Image.Image) -> Image.Image:
    """Turn a white mark printed on the band into white ink on transparency.

    Alpha comes from how far each pixel has travelled from the band's blue towards white, so
    the mark keeps its antialiased edges and anything the mark knocks out stays a hole for the
    band to show through.
    """
    crop = crop.convert('RGB')
    px = crop.load()
    base = px[0, 0]
    span = sum(abs(255 - c) for c in base) or 1

    out = Image.new('RGBA', crop.size)
    dst = out.load()
    for y in range(crop.height):
        for x in range(crop.width):
            distance = sum(abs(a - b) for a, b in zip(px[x, y], base))
            alpha = min(255, round(255 * distance / span))
            dst[x, y] = (255, 255, 255, alpha)
    return out


def install_strip() -> None:
    source, cells = STRIP
    plate = Image.open(IMG / source)
    scale = plate.width / 1920

    for slug, x, y, w, h in cells:
        # A pixel of margin, so the sample for the band's own colour is background.
        box = (
            round((x - 2) * scale),
            round((y - 2) * scale),
            round((x + w + 2) * scale),
            round((y + h + 2) * scale),
        )
        art = white_on_blue(plate.crop(box))
        bbox = art.getbbox()
        if bbox:
            art = art.crop(bbox)
        target = f'logo-{slug}-white.webp'
        art.save(IMG / target, 'WEBP', quality=95, method=6)
        print(f'{target:28} {art.size[0]}x{art.size[1]}  comp {w}x{h}')


def main() -> None:
    for source, target, tol in JOBS:
        img = key_from_edges(Image.open(IMG / source), tol)
        box = img.getbbox()
        if box:
            img = img.crop(box)
        img.save(IMG / target, 'WEBP', quality=95, method=6)
        print(
            f'{source} -> {target}  {img.size[0]}x{img.size[1]}'
            f'  ratio {img.size[0] / img.size[1]:.2f}'
        )

    install_strip()


if __name__ == '__main__':
    main()
