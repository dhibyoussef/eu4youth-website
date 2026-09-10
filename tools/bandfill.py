"""Compare each band's true background against the plate the build serves.

The build paints bands as crops of the comp with the copy scrubbed out. Where the
scrubbing fill misses the band's real colour it leaves a rectangle behind the live
text, which is the "something is behind it" the review kept reporting. This
reports, per band, the comp's dominant background colour and whether the plate
still agrees with it — the ones that disagree have to become CSS colour.

Usage: python tools/bandfill.py
"""

from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / 'AppData/Local/Temp/eu4youth-extract'
RENDER_SCALE = 1  # renders and shots are both 1920 wide, matching design px

# name, design-px top, bottom, and the plate the build serves for it
BANDS = [
    ('hero', 277, 1330, 'home-hero-v2.jpg'),
    ('chiffres', 1330, 2175, 'home-chiffres.png'),
    ('six projets', 2175, 3040, 'home-projets.png'),
    ('map', 3040, 4057, 'home-map.jpg'),
    ('streams', 4057, 6010, None),
    ('stories', 6010, 7180, 'home-stories-v2.jpg'),
    ('publications', 7353, 8600, 'home-publications.jpg'),
    ('newsletter', 8600, 9480, None),
]


def dominant(pixels: np.ndarray, count: int = 4) -> list[tuple[tuple[int, ...], float]]:
    flat = pixels.reshape(-1, 3)
    tally = Counter(map(tuple, flat[:: max(1, len(flat) // 40000)]))
    total = sum(tally.values())
    return [(tone, hits / total) for tone, hits in tally.most_common(count)]


def main() -> None:
    comp = np.asarray(Image.open(OUT / 'renders/Accueil-p1.png').convert('RGB'))
    shot = np.asarray(Image.open(OUT / 'shots/home.png').convert('RGB'))

    for name, top, bottom, plate in BANDS:
        y0, y1 = top * RENDER_SCALE, bottom * RENDER_SCALE
        print(f'\n=== {name}  ({top} -> {bottom}) ===')
        for label, image in (('comp ', comp), ('build', shot)):
            if y1 > image.shape[0]:
                print(f'  {label}: band falls outside the image')
                continue
            tones = dominant(image[y0:y1])
            summary = '  '.join(
                f'{"#%02x%02x%02x" % tone} {share * 100:4.1f}%' for tone, share in tones
            )
            print(f'  {label}: {summary}')
        if plate:
            print(f'  plate: {plate}')


if __name__ == '__main__':
    main()
