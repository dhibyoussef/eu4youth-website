"""Compare where each text block's ink sits in the design and in the build.

Both the comp render and the build screenshot are measured against the same
reference: the artwork plate, which is the comp with every glyph redacted away.
Subtracting it isolates type from background in each image, so the comparison
works over photography and gradients as well as over flat colour, and needs no
font metrics or PDF baseline arithmetic.

Each region is described by the *measured PDF geometry* of the block's first
line, and the window around it is derived from the type size. A PDF span's y is
an em-box top, and glyph ink always starts below it, so the window only needs a
sliver of headroom — which is what keeps a neighbouring line, or the edge of a
button the build draws itself, from being mistaken for the first inked row.

  dy > 0  the build sits too high      -> add dy to the element's `top`
  dx > 0  the build sits too far left  -> add dx to the element's `left`

With --emit the design's ink positions are written out for calibrate.mjs, which
turns them into CSS `top` values by subtracting the browser's own ink offset for
that face, size and line-height. That is a one-shot derivation; running without
--emit then verifies the result against the comp.

Usage:
  python tools/align.py home.png Accueil-p1 [nameFilter] [--masks]
  python tools/align.py --emit Accueil-p1
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"

# Per-channel distance from the plate above which a pixel counts as type.
# High enough to ignore JPEG ringing and gradient banding.
INK = 60

# Rows/columns with fewer inked pixels than this are treated as speckle.
MIN_RUN = 3

# How far above the PDF y to look, as a fraction of the type size. Ink starts
# below the em-box top, so this only needs to cover antialiasing and accents.
HEADROOM = 0.12

# name, x, y, width, size — first line of the block, straight from the comp.
Region = tuple[str, float, float, float, float]
REGIONS: list[Region] = [
    ("nav programme", 68.0, 173.3, 118.2, 23),
    ("hero badge", 284.6, 360.3, 715.7, 27),
    ("hero headline", 278.5, 419.6, 770.4, 73),
    ("hero body", 278.5, 813.2, 743.4, 22),
    ("hero cta 1", 312.6, 942.9, 202.1, 22),
    ("chiffres title", 361.1, 1496.8, 1197.7, 115),
    ("chiffres period", 804.1, 1637.5, 311.8, 50),
    ("kpi value", 89.7, 1837.7, 141.0, 50),
    ("kpi label", 73.9, 1897.7, 172.4, 50),
    ("projets title", 85.9, 2347.4, 628.6, 115),
    ("projets subtitle", 85.9, 2486.2, 805.1, 79),
    ("projets body", 85.9, 2633.8, 1733.6, 32),
    ("map title", 146.5, 3252.4, 666.4, 141),
    ("map subtitle", 146.5, 3423.2, 674.2, 74),
    ("map body", 145.3, 3551.4, 679.4, 32),
    ("map cta", 160.7, 3921.6, 234.7, 32),
    ("stream head 1", 59.7, 4199.2, 504.3, 75),
    ("stream head 2", 59.7, 4279.3, 328.1, 75),
    ("card cta", 1054.7, 4985.0, 107.9, 21.08),
    ("stream cta 1", 78.2, 5748.0, 375.1, 30),
    ("stream cta 2", 729.6, 5763.1, 328.7, 30),
    ("stream cta 3", 1338.4, 5764.5, 285.3, 30),
    ("stories eyebrow", 790.7, 6377.0, 476.2, 60),
    ("stories headline", 790.7, 6448.4, 1031.6, 86),
    ("stories cta", 1313.5, 6881.6, 391.0, 32),
    ("pubs title", 66.9, 7661.2, 825.1, 115),
    ("pubs body", 65.8, 7994.8, 894.4, 32),
    ("pubs cta", 90.8, 8230.7, 471.4, 32),
    ("news title", 86.6, 8672.8, 957.1, 108),
    ("news body", 86.6, 8844.1, 839.5, 32),
    ("news field", 112.0, 9081.9, 293.2, 32),
    ("news legal", 86.6, 9200.6, 832.5, 21),
    ("footer head", 76.3, 9700.3, 250.4, 36),
    ("footer link", 76.3, 9757.6, 324.4, 34),
    ("footer disclaimer", 1023.4, 10171.5, 794.4, 21),
]

# When the line above is close enough that its descenders reach into the window,
# the window is retaken from here instead: below anything the previous line can
# reach (~0.10 of a size past the em-box top) and above this line's own ink,
# which starts around 0.58 of a size past it for caps.
CLEARANCE = 0.16


def window(region: Region, clear: bool = False) -> tuple[int, int, int, int]:
    _, x, y, width, size = region
    top = y + size * CLEARANCE if clear else y - size * HEADROOM
    return (int(x - 4), int(top), int(x + width + 10), int(y + size * 1.15))


def ink_box(
    image: Image.Image, plate: Image.Image, box: tuple[int, int, int, int]
) -> tuple[int | None, int | None, int]:
    """Top-left corner of the type in a region, measured against the plate."""
    a = np.asarray(image.crop(box), dtype=np.int16)
    b = np.asarray(plate.crop(box), dtype=np.int16)
    mask = np.abs(a - b).max(axis=2) > INK

    total = int(mask.sum())
    if total == 0:
        return None, None, 0

    def first(profile: np.ndarray) -> int | None:
        hits = np.flatnonzero(profile >= MIN_RUN)
        return int(hits[0]) if hits.size else None

    return first(mask.sum(axis=1)), first(mask.sum(axis=0)), total


def measure(
    image: Image.Image, plate: Image.Image, region: Region
) -> tuple[float | None, float | None, tuple[int, int, int, int]]:
    """Ink top-left in page coordinates, retrying clear of the line above."""
    for clear in (False, True):
        box = window(region, clear)
        top, left, count = ink_box(image, plate, box)
        if count == 0:
            return None, None, box
        # Ink on the first row means something above is bleeding in.
        if top > 0:
            return box[1] + top, box[0] + left, box
    return None, None, box


def dump_masks(
    design: Image.Image,
    shot: Image.Image,
    plate: Image.Image,
    name: str,
    box: tuple[int, int, int, int],
) -> None:
    """Save the isolated type from both images, stacked, for eyeballing."""
    width, height = box[2] - box[0], box[3] - box[1]
    sheet = Image.new("RGB", (width, height * 2 + 6), "#ff00ff")
    for index, source in enumerate((design, shot)):
        a = np.asarray(source.crop(box), dtype=np.int16)
        b = np.asarray(plate.crop(box), dtype=np.int16)
        mask = (np.abs(a - b).max(axis=2) > INK).astype(np.uint8) * 255
        sheet.paste(Image.fromarray(255 - mask).convert("RGB"), (0, index * (height + 6)))
    target = OUT / "compare" / f"mask-{name.replace(' ', '-')}.png"
    target.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(target)
    print(f"  masks (design over build) -> {target}")


def emit(tag: str) -> None:
    """Write the design's measured ink positions for calibrate.mjs to consume."""
    design = Image.open(OUT / "renders" / f"{tag}.png").convert("RGB")
    plate = Image.open(OUT / "plates" / f"{tag}-plate.png").convert("RGB")

    out: dict[str, dict[str, float]] = {}
    for region in REGIONS:
        name, x, y, _, size = region
        top, left, _ = measure(design, plate, region)
        if top is None:
            print(f"{name:<19} no type found — skipped")
            continue
        out[name] = {"inkTop": top, "inkLeft": left, "pdfY": y, "pdfX": x, "size": size}
        print(
            f"{name:<19} ink top {top:>8.1f}   pdf y {y:>8.1f}"
            f"   drop {(top - y) / size:>6.3f} em"
        )

    target = OUT / "geometry" / f"ink-{tag}.json"
    target.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"\n-> {target}")


def main() -> None:
    if sys.argv[1] == "--emit":
        emit(sys.argv[2])
        return

    shot = Image.open(OUT / "shots" / sys.argv[1]).convert("RGB")
    design = Image.open(OUT / "renders" / f"{sys.argv[2]}.png").convert("RGB")
    plate = Image.open(OUT / "plates" / f"{sys.argv[2]}-plate.png").convert("RGB")
    args = sys.argv[3:]
    dump = "--masks" in args
    only = next((a for a in args if not a.startswith("--")), None)

    print(f"{'region':<19}{'dy':>6}{'dx':>6}   action")
    for region in REGIONS:
        name = region[0]
        if only and only not in name:
            continue
        dtop, dleft, box = measure(design, plate, region)
        btop, bleft, _ = measure(shot, plate, region)

        if dtop is None or btop is None:
            where = "design" if dtop is None else "build"
            print(f"{name:<19}{'?':>6}{'?':>6}   no type found in {where}")
            if dump:
                dump_masks(design, shot, plate, name, box)
            continue

        dy, dx = round(dtop - btop), round(dleft - bleft)
        parts = []
        if abs(dy) >= 1:
            parts.append(f"top {dy:+d}")
        if abs(dx) >= 1:
            parts.append(f"left {dx:+d}")
        action = ", ".join(parts) if parts else "aligned"
        print(f"{name:<19}{dy:>6}{dx:>6}   {action}")
        if dump:
            dump_masks(design, shot, plate, name, box)


if __name__ == "__main__":
    main()
