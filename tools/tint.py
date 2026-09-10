"""Solve the wash the comp lays over the hero photograph.

The hero is still served as a crop of the comp, which means the comp's printed
buttons are in it — live buttons sit over them and leave a sliver of the printed
one showing wherever the two disagree by a pixel. The photograph exists in the
file as its own image, so the band can be rebuilt from that instead, which needs
the wash between the photo and what the comp finally shows.

Fits `shown = photo * (1 - a) + colour * a` by least squares over the band, then
reports the residual: a small one means a flat colour at one opacity is the whole
story and CSS can draw it, a large one means the comp used something richer.

Usage: python tools/tint.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / 'AppData/Local/Temp/eu4youth-extract'
ASSETS = OUT / 'assets'
PHOTO = 'Accueil-p1-x28523-2001x1192.png'

# Where the comp places the photograph, in design px, from tools/places.py.
PLACE = (-29.0, 137.3, 2001.0, 1192.0)
# Sampled below the copy and clear of the buttons, so only photo and wash are seen.
SAMPLE = (1080, 1310, 40, 1900)  # y0, y1, x0, x1


def main() -> None:
    comp = np.asarray(Image.open(OUT / 'renders/Accueil-p1.png').convert('RGB'),
                      dtype=np.float64)
    px, py, pw, ph = PLACE
    photo = Image.open(ASSETS / PHOTO).convert('RGB').resize(
        (round(pw), round(ph)), Image.LANCZOS
    )
    # Lay the photo on a page-sized canvas so the two line up by construction. It
    # is placed 29px off the left edge and runs 52px past the right, so both ends
    # are clipped to the page.
    canvas = np.zeros_like(comp)
    left, top = round(px), round(py)
    source_x0 = max(0, -left)
    width = min(round(pw) - source_x0, comp.shape[1] - max(0, left))
    canvas[top:top + round(ph), max(0, left):max(0, left) + width] = (
        np.asarray(photo, dtype=np.float64)[:, source_x0:source_x0 + width]
    )

    y0, y1, x0, x1 = SAMPLE
    source = canvas[y0:y1, x0:x1].reshape(-1, 3)
    shown = comp[y0:y1, x0:x1].reshape(-1, 3)

    # For each channel, shown = source*(1-a) + c*a is linear in source with slope
    # (1-a) and intercept c*a, so one fit per channel gives both.
    print(f'{"ch":<4}{"slope":>9}{"->  alpha":>12}{"colour":>9}{"residual":>11}')
    alphas, colours = [], []
    for index, name in enumerate('RGB'):
        s, t = source[:, index], shown[:, index]
        slope, intercept = np.polyfit(s, t, 1)
        alpha = 1 - slope
        colour = intercept / alpha if alpha > 1e-6 else 0.0
        residual = float(np.std(t - (slope * s + intercept)))
        alphas.append(alpha)
        colours.append(colour)
        print(f'{name:<4}{slope:9.4f}{alpha:12.4f}{colour:9.1f}{residual:11.2f}')

    alpha = float(np.mean(alphas))
    colour = [int(round(c)) for c in colours]
    print(f'\nwash: rgba({colour[0]}, {colour[1]}, {colour[2]}, {alpha:.3f})')
    hexed = '#{:02x}{:02x}{:02x}'.format(*[max(0, min(255, c)) for c in colour])
    print(f'      {hexed} at {alpha * 100:.1f}% opacity')

    # Check the fit as a whole, using one alpha and one colour for all channels.
    modelled = source * (1 - alpha) + np.array(colour) * alpha
    error = np.abs(modelled - shown)
    print(f'\nfit over {len(shown):,} sampled pixels:  mean error {error.mean():.2f}, '
          f'95th percentile {np.percentile(error, 95):.2f}, worst {error.max():.1f}')


if __name__ == '__main__':
    main()
