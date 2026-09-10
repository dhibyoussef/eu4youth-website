"""Install the supplied EU4Youth wordmark and build the tab icons from its mark.

The wordmark is 1.57:1, so shrinking the whole of it into a 16px tab icon leaves
nothing legible. The logo opens with a squarish block of four glyphs before the
word continues, and that block is the mark; this finds it by looking for the gap
in the ink where the block ends and crops the icons from there.

Usage: python tools/favicon.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

SUPPLIED = Path.home() / (
    '.cursor/projects/c-Users-youss-OneDrive-Attachments-Desktop-fi2t-live-editor'
    '/assets/c__Users_youss_AppData_Roaming_Cursor_User_workspaceStorage'
    '_empty-window_images_image-3e328b89-e917-47c6-9a82-7933f4a39df6.png'
)
PUBLIC = Path(__file__).resolve().parents[1] / 'public'

ICO_SIZES = [(16, 16), (32, 32), (48, 48), (64, 64)]
TOUCH_SIZE = 180
EU_BLUE = (7, 77, 161)


def ink_mask(image: Image.Image) -> np.ndarray:
    rgba = np.asarray(image.convert('RGBA'))
    if rgba[..., 3].min() < 250:
        return rgba[..., 3] > 8
    return rgba[..., :3].min(axis=2) < 245


def main() -> None:
    logo = Image.open(SUPPLIED).convert('RGBA')
    (PUBLIC / 'img').mkdir(parents=True, exist_ok=True)
    logo.save(PUBLIC / 'img/logo-eu4youth.png', optimize=True)
    print(f'logo-eu4youth.png  {logo.width}x{logo.height}')

    # The mark is the block of four glyphs — green bars, pink u, teal 4, orange y —
    # and the "outh" that finishes the word, with the hashtag under it, are both set
    # in EU blue. Cutting at the first blue column separates the two, where looking
    # for a gap in the ink only finds the space between the mark's own two columns.
    rgb = np.asarray(logo.convert('RGB'), dtype=np.int16)
    ink = ink_mask(logo)
    blue = ink & (np.abs(rgb - np.array(EU_BLUE)).max(axis=2) <= 24)
    wordmark_starts = int(np.flatnonzero(blue.any(axis=0))[0])

    block = ink.copy()
    block[:, wordmark_starts:] = False
    rows = np.flatnonzero(block.any(axis=1))
    cols = np.flatnonzero(block.any(axis=0))
    left, right = int(cols[0]), int(cols[-1]) + 1
    top, bottom = int(rows[0]), int(rows[-1]) + 1
    mark = logo.crop((left, top, right, bottom))
    print(f'mark  {mark.width}x{mark.height}  at x {left} y {top}'
          f'  aspect {mark.width / mark.height:.3f}')

    # Centre the mark on a square with a little breathing room, so the icon is not
    # cropped or stretched at any of the sizes a browser asks for.
    side = round(max(mark.width, mark.height) * 1.16)
    square = Image.new('RGBA', (side, side), (255, 255, 255, 0))
    square.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2), mark)

    square.resize((TOUCH_SIZE, TOUCH_SIZE), Image.LANCZOS).save(
        PUBLIC / 'apple-touch-icon.png', optimize=True
    )
    square.resize((512, 512), Image.LANCZOS).save(
        PUBLIC / 'icon-512.png', optimize=True
    )
    square.resize((64, 64), Image.LANCZOS).save(
        PUBLIC / 'favicon.ico', sizes=ICO_SIZES
    )
    for name in ('apple-touch-icon.png', 'icon-512.png', 'favicon.ico'):
        path = PUBLIC / name
        print(f'{name:<22} {path.stat().st_size / 1024:.1f} KB')

    stale = PUBLIC / 'favicon.svg'
    if stale.exists():
        stale.unlink()
        print('removed the placeholder favicon.svg')


if __name__ == '__main__':
    main()
