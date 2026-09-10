"""Install the design pack's own photographs as web assets.

The pack ships the pictures the comp was built from, which beats recovering them from
the PDF: full resolution, no keying against a band colour, and the cut-outs are already
detoured. What it does not ship is transparency — the cut-outs sit on white — so the
white has to come back off before they can go on pink or teal.

A brightness threshold cannot do that: the book stack is mostly white paper and the
jumping figure wears white trainers, and both would be eaten. So the white is taken as
the region *connected to the border*, which is what a background is, leaving every
enclosed white inside the subject alone.

Usage: python tools/photos.py
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = (Path(__file__).resolve().parents[2]
       / 'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design/images')
PUBLIC = Path(__file__).resolve().parents[1] / 'public/img'

QUALITY = 82

# Cut-outs: white background keyed off, kept at a size that suits how large they are
# actually drawn. name -> (source, output width)
CUTOUTS = {
    'art-femme-saut': ('03_jeune_femme_saut_detoure.png', 851),
    'art-pile-livres': ('04_pile_de_livres.png', 900),
    'art-graffiti': ('Gemini_Generated_Image_com7g8com7g8com7.jpg', 720),
}

# Rectangular photographs. Only what the page actually renders is installed, since
# anything in public/ ships whether or not it is referenced. That is the interview shot
# the comp sets on all six cards. The pack's other subjects — the jetty behind the
# hero, and the trophy, mural, bottle caps and goats — go in when the hero is rebuilt
# from its own photograph and when the cards get real content.
PHOTOS = {
    'photo-entretien': ('02_entretien_cv_recrutement.png', 800),
}


def key_out_white(rgb: np.ndarray) -> np.ndarray:
    """Alpha for an image whose background is the white touching its border."""
    # Generous on what counts as white, because these were saved as JPEG or flattened
    # PNG and the background carries compression noise rather than a flat 255.
    whiteish = rgb.min(axis=2) >= 238

    labels, count = ndimage.label(whiteish)
    if count:
        border = np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
        background = np.isin(labels, np.unique(border[border > 0]))
    else:
        background = np.zeros(whiteish.shape, bool)

    # Ramp the edge over the pixels just outside the subject so the antialiased rim
    # fades instead of leaving a hard white fringe on a coloured band.
    distance = ndimage.distance_transform_edt(background)
    alpha = np.clip(1.0 - distance / 2.0, 0, 1)
    alpha[~background] = 1.0

    # Those rim pixels are white-contaminated; pull them back toward the subject so the
    # fringe does not read as a halo.
    return alpha


def resize(image: Image.Image, width: int) -> Image.Image:
    if image.width <= width:
        return image
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.LANCZOS)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    total = 0

    for name, (source, width) in CUTOUTS.items():
        rgb = np.asarray(Image.open(SRC / source).convert('RGB'))
        alpha = key_out_white(rgb)
        rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
        image = resize(Image.fromarray(rgba, 'RGBA'), width)
        path = PUBLIC / f'{name}.webp'
        image.save(path, quality=QUALITY, method=6)
        total += path.stat().st_size
        print(f'{path.name:24s} {image.width}x{image.height}  '
              f'{path.stat().st_size / 1024:5.0f} KB  '
              f'{(alpha < 0.5).mean() * 100:4.0f}% keyed out')

    for name, (source, width) in PHOTOS.items():
        image = resize(Image.open(SRC / source).convert('RGB'), width)
        path = PUBLIC / f'{name}.webp'
        image.save(path, quality=QUALITY, method=6)
        total += path.stat().st_size
        print(f'{path.name:24s} {image.width}x{image.height}  '
              f'{path.stat().st_size / 1024:5.0f} KB')

    print(f'\n{len(CUTOUTS) + len(PHOTOS)} files, {total / 1024:.0f} KB total')


if __name__ == '__main__':
    main()
