"""Install the À propos page's pictures.

Two sources. The governorate name plates, the partner logos and the two photographs
were supplied as files, so those are converted straight across. The Tunisia map and the
signpost artwork only exist inside the PDF, so those are clip-rendered out of it and
keyed against the colour of the band they sit on, the same way the homepage's road
drawing is — which keeps them as transparent art that composites onto whatever CSS
paints, rather than as a rectangle of baked-in background.

The map keeps its own lettering. Those are cartographic labels belonging to the
drawing, not page copy, so unlike the road drawing there is nothing to redact: no live
element will ever need to sit on top of them.

Usage: python tools/apropos_assets.py
"""

from pathlib import Path

import numpy as np
import pymupdf
from PIL import Image
from scipy import ndimage

ASSETS = (Path.home() / '.cursor/projects'
          / 'c-Users-youss-OneDrive-Attachments-Desktop-fi2t-live-editor/assets')
PDF = (Path(__file__).resolve().parents[2]
       / 'EU4Youth/UI Web Design-20260807T094637Z-1-001/UI Web Design/a propos.pdf')
PUBLIC = Path(__file__).resolve().parents[1] / 'public/img'
PREFIX = 'c__Users_youss_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_'

QUALITY = 84

# The six governorate name plates are supplied separately but the page never uses them
# separately: they are the faces of the signpost, which is clip-rendered whole below, so
# installing them again would ship the same artwork twice.
LOGOS = {
    'image42': 'org-jeunesse-sports',
    'image43': 'org-economie-planification',
    'image44': 'org-affaires-culturelles',
    'image45': 'org-mesrs',
    'image46': 'org-formation-emploi',
    'image47': 'org-observatoire-jeunesse',
    'image48': 'org-aneti',
    'image49': 'org-anpr',
    'image50': 'org-cgdr',
}

# Two of the supplied logo files are screenshots with a ruled frame around them rather
# than clean artwork. Keying the white inside the frame leaves the frame, which reads as
# a grey card sitting in the middle of the partner panel, so these are inset first by a
# fraction of their own size to cut the rule away before anything else happens.
LOGO_INSETS = {
    'org-mesrs': 0.035,
    'org-observatoire-jeunesse': 0.06,
}

PHOTOS = {
    'image51': ('apropos-atelier', 900),
    'image7': ('apropos-plongee', 900),
}

# Clip regions in page-1 coordinates, and the band colour to key away.
CLIPS = {
    # Measured off the render by the extent of the map's pink and grey fills, rather
    # than eyeballed: the first guess caught the legend card instead.
    'apropos-carte': ((1055, 7380, 1780, 8270), (255, 255, 255)),
    # The signpost's true bounds, measured by tools/artbox.py rather than off its arrows:
    # bounding the arrows alone cut 310px of post off the bottom and left a strip of empty
    # band on the right, which then pushed the visible signs past the window edge.
    # A few extra px on the right survive keying and keep arrow tips off the viewport edge.
    'apropos-panneaux-v3': ((1295, 12068, 1918, 13053), (218, 56, 112)),
    'icon-objectifs': ((68, 3988, 313, 4254), (255, 255, 255)),
}

# The three axis icons are drawn as vector rather than placed as images, so they have to
# be rendered out of the comp. Each sits on the tab it belongs to, and the open tab is
# orange while the closed two are white — so they are keyed against different colours
# and then flattened to one ink, leaving the page free to reverse the open one out in
# CSS instead of shipping two files per icon.
ICONS = {
    'icon-axe-1': ((1449, 5491, 1526, 5562), (242, 168, 73), 1),
    'icon-axe-2': ((1602, 5485, 1681, 5562), (255, 255, 255), 1),
    'icon-axe-3': ((1747, 5487, 1819, 5562), (255, 255, 255), 1),
    # The project card's five field marks, on page 2's near-white card.
    'icon-composante': ((266, 660, 354, 744), (249, 249, 249), 2),
    'icon-budget': ((268, 816, 352, 902), (249, 249, 249), 2),
    'icon-partenaire': ((263, 946, 356, 1018), (249, 249, 249), 2),
    'icon-territoire': ((1024, 680, 1108, 742), (249, 249, 249), 2),
    'icon-periode': ((1024, 780, 1108, 858), (249, 249, 249), 2),
}

ICON_INK = (242, 168, 73)


def find(number: str) -> Path:
    matches = sorted(ASSETS.glob(f'{PREFIX}a_propos-page1-{number}-*.png'))
    if not matches:
        raise FileNotFoundError(f'no supplied file for {number}')
    return matches[0]


def key_out(rgb: np.ndarray, background: tuple[int, int, int],
            tolerance: int = 18) -> np.ndarray:
    """Alpha for artwork whose background is the given colour, taken from the border.

    Connectivity to the border is what separates background from a same-coloured hole
    inside the artwork — a counter in a letter, or the white of a flag.
    """
    near = np.abs(rgb.astype(np.int16) - np.array(background)).max(axis=2) <= tolerance
    labels, count = ndimage.label(near)
    if not count:
        return np.ones(near.shape, np.float32)
    edge = np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    outside = np.isin(labels, np.unique(edge[edge > 0]))
    distance = ndimage.distance_transform_edt(outside)
    alpha = np.clip(1.0 - distance / 2.0, 0, 1).astype(np.float32)
    alpha[~outside] = 1.0
    return alpha


def save(image: Image.Image, name: str, width: int) -> int:
    if image.width > width:
        image = image.resize((width, round(image.height * width / image.width)),
                             Image.LANCZOS)
    path = PUBLIC / f'{name}.webp'
    image.save(path, quality=QUALITY, method=6)
    size = path.stat().st_size
    print(f'{path.name:32s} {image.width}x{image.height:<5d} {size / 1024:6.1f} KB')
    return size


def install_keyed(source: Path, name: str, width: int) -> int:
    """Convert a supplied file, keying its white background off only if it has none.

    Most of these arrive as RGBA with the background already transparent. Flattening
    those to RGB first turns every transparent pixel black, which is how a run of them
    came out as solid black rectangles with the lettering knocked out of them.
    """
    image = Image.open(source)

    inset = LOGO_INSETS.get(name)
    if inset:
        dx, dy = round(image.width * inset), round(image.height * inset)
        image = image.crop((dx, dy, image.width - dx, image.height - dy))

    if image.mode in ('RGBA', 'LA'):
        rgba = np.asarray(image.convert('RGBA'))
        # An RGBA file is not necessarily a cut-out. Several of these carry a fully
        # opaque white rectangle, which reads as a grey card once it lands on the
        # partner panel, so anything with no transparency at all still gets keyed.
        if rgba[..., 3].min() < 250:
            return save(image.convert('RGBA'), name, width)
        image = image.convert('RGB')

    rgb = np.asarray(image.convert('RGB'))
    alpha = key_out(rgb, (255, 255, 255))
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    return save(Image.fromarray(rgba, 'RGBA'), name, width)


def install_clip(rect: tuple[int, int, int, int],
                 background: tuple[int, int, int], name: str) -> int:
    x0, y0, x1, y1 = rect
    page = pymupdf.open(PDF)[0]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1, 1),
                          clip=pymupdf.Rect(x0, y0, x1, y1), alpha=False)
    rgb = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)
    alpha = key_out(rgb, background)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    return save(Image.fromarray(rgba, 'RGBA'), name, x1 - x0)


# Measured plates over the hero photograph, removed so the live controls do not sit on
# top of printed copies of themselves.
# Widened off the measured plates by a few pixels: the two outlined buttons are stroked
# at 2pt, and a stroke lies half outside the path it follows, so a rectangle drawn to the
# path's own bounds does not count as covering it and both outlines stayed behind.
HERO_BADGE = (272, 355, 900, 419)
HERO_BUTTONS = (
    (275, 974, 553, 1060),
    (570, 974, 930, 1060),
    (954, 974, 1314, 1060),
)


def install_hero() -> int:
    """The hero band's photograph, with the comp's own words lifted off it.

    The band is a single 1920x1162 image in the PDF with the blue wash already applied,
    so re-tinting a loose photograph would only be a guess at a colour that is sitting
    right there. What cannot come along is the printed headline, badge and buttons: live
    text has to go on top, and two headlines would show through each other.

    Lifting the words alone is not enough. The badge and the three buttons are plates
    drawn over the photograph, and sparing all line art left them behind — so the live
    buttons sat above three empty rectangles that moved out from under them whenever the
    type reflowed. They are vector, and the photograph is a separate image underneath, so
    removing the line art inside their rectangles uncovers the picture rather than
    punching a hole in it. Text and plates need opposite policies, hence two passes.
    """
    document = pymupdf.open(PDF)
    page = document[0]
    band = pymupdf.Rect(0, 262, 1920, 1331)

    for x0, y0, x1, y1, *_ in page.get_text('words'):
        word = pymupdf.Rect(x0, y0, x1, y1)
        if word.intersects(band):
            page.add_redact_annot(word, fill=None)
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)

    for plate in (HERO_BADGE, *HERO_BUTTONS):
        page.add_redact_annot(pymupdf.Rect(*plate), fill=None)
    # Only art the rectangle fully covers goes, so the plates are dropped while the
    # photograph they sit on, which runs far past them, is left alone.
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED)

    pix = page.get_pixmap(matrix=pymupdf.Matrix(1, 1), clip=band, alpha=False)
    image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    return save(image, 'apropos-hero-v2', 1920)


# The map, and the tight bounds of the governorate paths that make it up. The comp draws
# it as 26 filled shapes, grey for the country and pink for the gouvernorats the selected
# project works in — so it is not one flat picture, and it cannot be shipped as one if
# choosing a different project is meant to change which regions light up.
MAP = (1345, 7380, 1765, 8267)
MAP_GREY = (97, 94, 100)
MAP_PINK = (227, 65, 113)


def install_map() -> int:
    """Superseded by tools/tunisia_map.py — kept only to record why.

    This split the comp's map into a "neutral" base plus a Jeun'ESS overlay. The split was
    wrong in a way the bitmaps hid: the comp fills unlit gouvernorats with a dark grey at low
    opacity, so painting the pink regions over in that same grey at full opacity left
    Jeun'ESS's six shapes visibly darker than the country around them. Every other project
    then drew its own names over Jeun'ESS's lit regions, and the three national ones were a
    hue-rotate filter over the same picture.

    A map whose lit regions are a property of the artwork cannot answer to a chosen project,
    so the map now ships as one path per gouvernorat and this no longer runs. The comp's own
    paths were tried in between and are also unusable as data: they draw 23 gouvernorats,
    folding Ariana into its neighbours.
    """
    raise SystemExit('install_map is superseded by tools/tunisia_map.py')
    document = pymupdf.open(PDF)
    page = document[0]
    frame = pymupdf.Rect(*MAP)

    for x0, y0, x1, y1, *_ in page.get_text('words'):
        word = pymupdf.Rect(x0, y0, x1, y1)
        if word.intersects(frame):
            page.add_redact_annot(word, fill=None)
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)

    pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=frame, alpha=False)
    rgb = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)

    pink = np.abs(rgb.astype(np.int16) - np.array(MAP_PINK)).max(axis=2) < 60

    # The base: the whole country in one grey, the highlight painted back out of it.
    base = rgb.copy()
    base[pink] = MAP_GREY
    white = np.abs(rgb.astype(np.int16) - 255).max(axis=2) < 12
    total = save(Image.fromarray(np.dstack(
        [base, np.where(white, 0, 255).astype(np.uint8)]), 'RGBA'),
        'apropos-carte-base-v2', MAP[2] - MAP[0])

    # The overlay: only the pink, so it composites over the base.
    overlay = np.dstack([rgb, np.where(pink, 255, 0).astype(np.uint8)])
    total += save(Image.fromarray(overlay, 'RGBA'),
                  'apropos-carte-jeuness-v2', MAP[2] - MAP[0])
    return total


def install_icon(rect: tuple[int, int, int, int],
                 background: tuple[int, int, int], page_no: int, name: str) -> int:
    """One icon, keyed off whatever it sits on and flattened to a single ink colour."""
    x0, y0, x1, y1 = rect
    page = pymupdf.open(PDF)[page_no - 1]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(4, 4),
                          clip=pymupdf.Rect(x0, y0, x1, y1), alpha=False)
    rgb = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 3)

    # Distance from the tab colour, not connectivity to the border. These are line
    # drawings, and the counters inside a stroke are the background colour without
    # touching the edge — a flood fill from the border leaves them opaque, which is how
    # a set of fine outlines came out as solid blobs.
    distance = np.abs(rgb.astype(np.int16) - np.array(background)).max(axis=2)
    alpha = np.clip(distance / 90.0, 0, 1).astype(np.float32)

    ink = np.broadcast_to(np.array(ICON_INK, np.uint8), rgb.shape)
    rgba = np.dstack([ink, (alpha * 255).astype(np.uint8)])
    return save(Image.fromarray(rgba, 'RGBA'), name, (x1 - x0) * 2)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    total = install_hero()

    for number, name in LOGOS.items():
        total += install_keyed(find(number), name, 420)
    for number, (name, width) in PHOTOS.items():
        total += save(Image.open(find(number)).convert('RGB'), name, width)
    for name, (rect, background) in CLIPS.items():
        total += install_clip(rect, background, name)
    for name, (rect, background, page_no) in ICONS.items():
        total += install_icon(rect, background, page_no, name)

    print(f'\n{3 + len(LOGOS) + len(PHOTOS) + len(CLIPS) + len(ICONS)} files, '
          f'{total / 1024:.0f} KB total')


if __name__ == '__main__':
    main()
