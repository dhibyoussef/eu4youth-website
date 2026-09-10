"""Build web assets from the design PDFs.

Two kinds of output:

1. Artwork plates — the page rendered with all *text* redacted away, so the
   remaining photos / line art / decorative shapes can be cropped and used as
   backgrounds while the real text is overlaid as live HTML.

2. Named crops — specific regions pulled out of those plates at 2x for use as
   <img> or background-image.

Usage:  python tools/make_assets.py [name ...]

With no names every asset is rebuilt. Naming one or more (`home-hero.jpg`) builds just
those, which is what you want when a single plate's recipe changes: the rest are already
correct and rewriting them only churns bytes.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pymupdf
from PIL import Image

SRC = Path(
    r"C:\Users\youss\OneDrive\Attachments\Desktop\EU4Youth"
    r"\UI Web Design-20260807T094637Z-1-001\UI Web Design"
)
PLATES = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract" / "plates"
PUBLIC = Path(__file__).resolve().parent.parent / "public" / "img"

SCALE = 2  # export crops at 2x for retina

# name, pdf stem, page, x0, y0, x1, y1, keep_text
# Bounds verified against tools/bands.py band detection.
# keep_text=True crops the untouched page — used for logos and flag lockups
# whose captions are baked-in artwork rather than editable copy.
CROPS: list[tuple[str, str, int, float, float, float, float, bool]] = [
    # --- global chrome ---
    ("logo-eu4youth.png", "Accueil", 1, 30, 20, 220, 112, True),
    ("flags.png", "Accueil", 1, 1690, 12, 1910, 116, True),
    # nav utility icons sit on the flat blue bar, so the blue is cropped in too
    ("nav-mail.png", "Accueil", 1, 1698, 172, 1748, 218, True),
    ("nav-search.png", "Accueil", 1, 1766, 172, 1816, 218, True),
    ("nav-globe.png", "Accueil", 1, 1832, 172, 1882, 218, True),
    # --- home bands: artwork only, text is live HTML on top ---
    # Photography, line art, watermarks and the plain badge/button rectangles
    # stay in the plate; every glyph is redacted so real copy can sit over it.
    # -v2 because the plate changed but its name would not have: browsers held the first
    # version, whose primary button was still a printed orange plate.
    ("home-hero-v2.jpg", "Accueil", 1, 0, 277, 1920, 1330, False),
    # The chiffres and projets bands are not cropped at all. tools/artpieces.py
    # shows that once their flat background is discounted, everything left in
    # either one is type, or a project logo that is already its own asset — so
    # CSS draws the colour and the plates are gone. They were the reason live
    # text appeared to sit in a rectangle: no paint-out fill matches a band to
    # the last unit, and JPEG whites land at 253 where a plate expects 255.
    # The map band went the same way: CSS paints the white strip and the orange
    # block, tools/maparts.py cuts the road drawing out as a keyed PNG, and the disc
    # is SVG. The plate it replaced was the single heaviest asset on the page.
    # ("home-map.jpg", "Accueil", 1, 0, 3040, 1920, 4057, False),
    # Runs past the band on both sides: the torn edge above, and a graffiti tag
    # that hangs below into the white gap.
    ("home-stories-v2.jpg", "Accueil", 1, 0, 5914, 1920, 7236, False),
    ("home-publications.jpg", "Accueil", 1, 0, 7353, 1920, 8600, False),
    ("home-newsletter.jpg", "Accueil", 1, 995, 8640, 1920, 9340, False),
    # --- card internals ---
    # The photo overhangs the card's top edge, so the crop starts above it.
    ("card-thumb.jpg", "Accueil", 1, 59, 4424, 583, 4719, False),
    ("card-logo-fe3ila.png", "Accueil", 1, 397, 4747, 566, 4812, True),
    ("icon-calendar.png", "Accueil", 1, 73, 4986, 107, 5026, True),
    ("icon-pin-pink.png", "Accueil", 1, 430, 4984, 473, 5028, True),
    ("icon-pin-teal.png", "Accueil", 1, 1336, 4982, 1374, 5028, True),
    # The footer's blue is an ellipse gradient that is not worth curve-fitting in
    # CSS, and its logos, social glyphs and flag lockup are all artwork, so the
    # whole band ships as one plate with only the links live on top.
    ("home-footer.jpg", "Accueil", 1, 0, 9480, 1920, 10344, False),
    # --- project logos, in colour ---
    # Accueil prints the six as flat #D0D0D0 watermarks, with no colour left in
    # them to recover — except Jeun'ESS, whose pictogram is a raster image and so
    # escaped the greying. That inconsistency is the comp showing its own hover
    # state, so the coloured art is taken from the project banners, which carry
    # one logo each in the white strip under the nav. Page order there is not
    # project order; each was matched to its watermark by aspect ratio.
    ("logo-irada4youth.png", "projet banner", 6, 1637, 342, 1781, 412, True),
    ("logo-swafy.png", "projet banner", 3, 1703, 331, 1781, 418, True),
    ("logo-jeuness.png", "projet banner", 1, 1707, 334, 1781, 404, True),
    ("logo-fe3ila.png", "projet banner", 2, 1605, 342, 1781, 402, True),
    ("logo-maghroumin.png", "projet banner", 4, 1681, 339, 1781, 411, True),
    ("logo-go4youth.png", "projet banner", 5, 1554, 349, 1781, 400, True),
    # --- the same logos as Accueil's grey watermarks ---
    # Taken from the comp rather than desaturated from the colour art, because the
    # comp's greying is not a formula: it flattens most shapes to one #CCCCCC and
    # sends others to white, and which is which was decided per logo. Measured to
    # the watermark's ink box so it registers on the colour version exactly.
    ("logo-irada4youth-grey.png", "Accueil", 1, 102, 2874, 301, 2971, True),
    ("logo-swafy-grey.png", "Accueil", 1, 393, 2839, 525, 2986, True),
    ("logo-fe3ila-grey.png", "Accueil", 1, 889, 2878, 1110, 2953, True),
    ("logo-maghroumin-grey.png", "Accueil", 1, 1249, 2845, 1434, 2970, True),
    ("logo-go4youth-grey.png", "Accueil", 1, 1531, 2874, 1793, 2932, True),
]

# The six project logos are 50-230 px wide in the banners but are shown at up to
# 262 design px, so 2x is not enough to stay sharp on a retina display.
SCALE_OVERRIDES: dict[str, int] = {
    name: 6 for name, *_ in CROPS if name.startswith("logo-") and name != "logo-eu4youth.png"
}

# Jeun'ESS has no watermark to lift: its pictogram is a raster image, so it kept
# its colours when the other five were greyed, and it is the odd one out in the
# comp. Its rest state is synthesised from the colour art instead.
SYNTHESISE_GREY = "logo-jeuness.png"


# Regions whose type is artwork rather than copy — logo wordmarks — and so must
# survive redaction. Without these the plate keeps only the drawn part of each
# project logo, and overlaying a complete copy on top shows both.
# pdf stem, page, x0, y0, x1, y1
TEXT_KEEP: list[tuple[str, int, float, float, float, float]] = [
    ("Accueil", 1, 40, 2810, 1890, 3025),  # six project logos
    ("Accueil", 1, 45, 10210, 865, 10305),  # same logos, in the footer
    ("Accueil", 1, 50, 9490, 225, 9635),  # footer EU4Youth lockup
    ("Accueil", 1, 1665, 9495, 1905, 9605),  # footer flag lockup and its caption
]


# The watermark tone the comp prints the six logos in, and the ink threshold that
# separates a logo's coloured shapes from the white ground and the white details
# inside them. Measured off Accueil.pdf: the band is pure white and every grey
# pixel in the strip is exactly this value.
WATERMARK = (204, 204, 204)


# The controls the comp prints inside the bands that are still served as crops,
# in page px, from tools/btnfind.py. These have to come out of the crop.
#
# A live button drawn over a printed one only lines up at the design's own 1920
# width. Everywhere else the page scales by 100vw/192, so the crop is resampled as
# a bitmap while the button is scaled as geometry; their edges then land on
# different subpixels and a sliver of the printed button shows along whichever
# edge falls short. That is what reads as something sitting behind the button.
#
# "stroke" clears only the 2px outline, leaving the photography or flat colour
# inside it untouched. "fill" clears the whole rectangle, which can only be
# smoothly interpolated rather than recovered.
#
# "vector" does not touch the raster at all: the plate is dropped from the PDF before
# anything is rendered, so what comes back is the photograph the comp drew it over. It
# only works where the plate is a path of its own that a redaction rect can cover
# whole — which is the case for the solid plates on the hero, whatever the note on
# load_page used to say. Use it for any plate a live control does not cover opaquely,
# since an interpolated patch shows through a transparent button and the real
# photograph does not.
PAINT_OUT: dict[str, list[tuple[float, float, float, float, str]]] = {
    "home-hero-v2.jpg": [
        # The eyebrow's orange plate. Not a button, but the same problem: it is line
        # art so it survives text redaction, the live badge covers it exactly at the
        # design width, and once the band reflows the two separate and the printed
        # one is left stranded across the photograph.
        (278.0, 361.3, 735.9, 51.4, "vector"),
        # The primary call to action. Outlined like the two beside it now, so its
        # interior is the photograph and the comp's orange plate cannot be left under
        # it — interpolating it away is not enough when nothing opaque covers it.
        (281.1, 925.2, 265.1, 73.1, "vector"),
        (576.3, 925.2, 347.2, 73.1, "stroke"),
        (960.0, 925.2, 347.2, 73.1, "stroke"),
    ],
    # Outlined white on the pink, so the live button's interior is this artwork and
    # "stroke" was not enough: clearing the outline alone left the comp's printed
    # chevron inside it, which the live button covered only at the design's own
    # width and which stood alone on the pink at every smaller canvas.
    # Grown by 3px a side so the rect covers the outline's own stroke, which is
    # centred on the rectangle and so hangs outside it: a redaction only drops art
    # it covers whole, and at the plate's exact bounds the outline stayed behind
    # while the chevron inside it went.
    "home-stories-v2.jpg": [(1284.3, 6860.9, 512.1, 96.1, "vector")],
    "home-publications.jpg": [(64.6, 8213.0, 529.2, 90.1, "stroke")],
}

# How far either side of the printed edge to clear, in page px. The comps stroke
# their buttons at 2px centred on the rectangle, so half of it falls outside; 2px
# takes that half and its antialiasing. Going wider is what leaves a visible mark:
# the clearing copies inward from the columns beside it, and replicating a column
# across a wide band reads as a vertical streak on photography.
PAINT_OUT_PAD = 2.0


def covered_plates(pdf_stem: str, page_no: int) -> list[pymupdf.Rect]:
    """The "vector" plates on this page, in page coordinates.

    PAINT_OUT is keyed by the asset a plate has to come out of, and CROPS says which page
    that asset is cut from, so the two together give the rects to drop before rendering.
    """
    rects: list[pymupdf.Rect] = []
    for name, stem, no, x0, y0, *_ in CROPS:
        if stem != pdf_stem or no != page_no:
            continue
        for bx, by, bw, bh, mode in PAINT_OUT.get(name, []):
            if mode == "vector":
                rects.append(pymupdf.Rect(bx, by, bx + bw, by + bh))
    return rects


def erase_controls(
    pixels: np.ndarray,
    controls: list[tuple[float, float, float, float, str]],
    origin: tuple[float, float],
    scale: float,
) -> int:
    """Replace the comp's printed controls with the artwork around them.

    Each masked pixel takes the value of the nearest unmasked one, which for an
    outline is the photograph or flat colour immediately beside it, then the patch
    is softened so no hard edge is left where the mask ran.
    """
    from scipy import ndimage

    height, width = pixels.shape[:2]
    x0, y0 = origin
    mask = np.zeros((height, width), bool)

    for bx, by, bw, bh, mode in controls:
        left = (bx - x0) * scale
        top = (by - y0) * scale
        pad = PAINT_OUT_PAD * scale

        def span(start: float, length: float, grow: float) -> tuple[slice, slice]:
            return slice(max(0, int(round(start - grow))),
                         int(round(start + length + grow)))

        outer_x = span(left, bw * scale, pad)
        outer_y = span(top, bh * scale, pad)
        mask[outer_y, outer_x] = True

        if mode == "stroke":
            # Keep only a thin band straddling the edge. Everything further in is
            # covered by the live button anyway, and clearing it would mean
            # interpolating across a wide span for no gain.
            inner_x = span(left, bw * scale, -pad)
            inner_y = span(top, bh * scale, -pad)
            mask[inner_y, inner_x] = False

    if not mask.any():
        return 0

    _, (rows, cols) = ndimage.distance_transform_edt(
        mask, return_distances=True, return_indices=True
    )
    filled = pixels.copy()
    filled[mask] = pixels[rows[mask], cols[mask]]

    # Soften only what was cleared, and only just enough to lose the step where
    # the copied value meets the pixel it came from. Blurring past the mask is
    # what turned the patch into a visible bar of its own.
    smooth = np.dstack([
        ndimage.gaussian_filter(filled[:, :, channel].astype(np.float32), 0.7)
        for channel in range(pixels.shape[2])
    ])
    filled[mask] = smooth[mask].astype(pixels.dtype)
    pixels[...] = filled
    return int(mask.sum())


def write_watermark(source: Path, target: Path) -> tuple[int, int]:
    """Write `source` again as a flat grey watermark in the comp's tone.

    Only needed for the one logo the comp has no watermark of. Ink coverage
    becomes alpha and all of it is painted the single grey, rather than
    desaturated: desaturating would give the logo its own luminance and not the
    flat tone the other five are printed in.

    Coverage is distance from white on the strongest channel, which reads a
    saturated colour as full ink and near-white as none.
    """
    rgba = np.asarray(Image.open(source).convert("RGBA"), dtype=np.float32)
    coverage = 1.0 - rgba[:, :, :3].min(axis=2) / 255.0
    coverage *= rgba[:, :, 3] / 255.0

    out = np.zeros_like(rgba, dtype=np.uint8)
    out[:, :, 0], out[:, :, 1], out[:, :, 2] = WATERMARK
    out[:, :, 3] = np.clip(coverage * 255.0, 0, 255).astype(np.uint8)

    image = Image.fromarray(out, mode="RGBA")
    image.save(target)
    return image.size


def load_page(pdf_stem: str, page_no: int, strip_text: bool) -> pymupdf.Page:
    """Open a page, with the plates named in PAINT_OUT dropped and optionally all text
    redacted away, but every other piece of artwork kept.

    Line art is only ever removed where a redaction rect covers a path whole, which is
    the difference between dropping a printed button and dropping the band it sits on:
    the comps do draw backgrounds and the Tunisia map as large shared paths, and a rect
    that merely touches those leaves nothing behind. A plate that a rect can contain is
    its own path, and taking it out here gives back the photograph underneath instead of
    the interpolation the raster pass can manage.
    """
    doc = pymupdf.open(SRC / f"{pdf_stem}.pdf")
    page = doc[page_no - 1]
    page._keep_doc = doc  # keep the document alive for the caller

    plates = covered_plates(pdf_stem, page_no)
    if plates:
        for rect in plates:
            page.add_redact_annot(rect + (-1, -1, 1, 1))
        # Its own pass: this one removes line art, and the text pass below must not.
        page.apply_redactions(
            images=pymupdf.PDF_REDACT_IMAGE_NONE,
            graphics=pymupdf.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED,
            text=pymupdf.PDF_REDACT_TEXT_NONE,
        )

    if not strip_text:
        return page

    keep = [
        pymupdf.Rect(x0, y0, x1, y1)
        for stem, no, x0, y0, x1, y1 in TEXT_KEEP
        if stem == pdf_stem and no == page_no
    ]

    for block in page.get_text("dict").get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                if not span.get("text", "").strip():
                    continue
                rect = pymupdf.Rect(span["bbox"])
                if any(rect in area for area in keep):
                    continue
                # fill=False leaves the artwork behind the glyphs intact;
                # the default would paint white boxes over the photography.
                page.add_redact_annot(rect + (-1, -1, 1, 1), fill=False)

    page.apply_redactions(
        images=pymupdf.PDF_REDACT_IMAGE_NONE,
        graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
        text=pymupdf.PDF_REDACT_TEXT_REMOVE,
    )
    return page


def main() -> None:
    PLATES.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    wanted = set(sys.argv[1:])
    unknown = wanted - {name for name, *_ in CROPS}
    if unknown:
        raise SystemExit(f'not an asset this builds: {", ".join(sorted(unknown))}')

    cache: dict[tuple[str, int, bool], pymupdf.Page] = {}

    for name, stem, page_no, x0, y0, x1, y1, keep_text in CROPS:
        if wanted and name not in wanted:
            continue
        key = (stem, page_no, keep_text)
        if key not in cache:
            cache[key] = load_page(stem, page_no, strip_text=not keep_text)
            if not keep_text:
                full = cache[key].get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
                full.save(PLATES / f"{stem}-p{page_no}-plate.png")
        page = cache[key]

        is_jpeg = name.endswith(".jpg")
        scale = SCALE_OVERRIDES.get(name, SCALE)
        pix = page.get_pixmap(
            matrix=pymupdf.Matrix(scale, scale),
            clip=pymupdf.Rect(x0, y0, x1, y1),
            alpha=not is_jpeg,
        )
        target = PUBLIC / name
        # The vector ones are already gone from the page, so only the raster modes are
        # left for erase_controls to clear.
        controls = [c for c in PAINT_OUT.get(name, []) if c[4] != "vector"]
        if controls:
            mode = "RGB" if is_jpeg else "RGBA"
            pixels = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
                pix.height, pix.width, pix.n
            ).copy()
            cleared = erase_controls(pixels, controls, (x0, y0), scale)
            image = Image.fromarray(pixels, mode=mode)
            image.save(target, quality=86) if is_jpeg else image.save(target)
            print(f"{name:<28} {pix.width}x{pix.height}  "
                  f"{target.stat().st_size / 1024:.0f} KB  "
                  f"({len(controls)} printed controls erased, {cleared:,} px)")
            continue

        pix.save(target, jpg_quality=86) if is_jpeg else pix.save(target)
        print(f"{name:<28} {pix.width}x{pix.height}  {target.stat().st_size / 1024:.0f} KB")

        if name == SYNTHESISE_GREY:
            grey = target.with_stem(target.stem + "-grey")
            width, height = write_watermark(target, grey)
            print(f"{grey.name:<28} {width}x{height}  {grey.stat().st_size / 1024:.0f} KB")

    print(f"\nplates -> {PLATES}\npublic -> {PUBLIC}")


if __name__ == "__main__":
    main()
