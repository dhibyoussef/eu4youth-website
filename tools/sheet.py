"""Stack comp / rest / hover for each control into one reviewable sheet.

states.mjs writes the live shots; this puts the comp beside them so the resting
state can be judged against the printed plate and the hover state can be judged
for whether it follows BUTTON GUIDLINE.pdf.

Usage:  python tools/sheet.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"
STATES = OUT / "states"
PAD = 14  # must match states.mjs

# name, page x, page y, w, h  — as reported by states.mjs
TARGETS = [
    ("hero-fill", 281, 925, 265, 73),
    ("hero-line", 576, 925, 347, 73),
    ("map", 145, 3903, 332, 91),
    ("stories", 1287, 6864, 506, 90),
    ("pubs", 65, 8213, 529, 90),
    ("stream-cta", 63, 5749, 521, 84),
    ("card-btn", 1019, 4982, 187, 45),
]

GUTTER = 10
LABELS = ("comp", "rest", "hover")


def main() -> None:
    design = Image.open(OUT / "renders" / "Accueil-p1.png").convert("RGB")

    rows = []
    for name, x, y, width, height in TARGETS:
        box = (
            max(0, x - PAD),
            max(0, y - PAD),
            x + width + PAD,
            y + height + PAD,
        )
        frames = [design.crop(box)]
        for state in ("rest", "hover"):
            path = STATES / f"{name}-{state}.png"
            if path.exists():
                frames.append(Image.open(path).convert("RGB"))
        rows.append((name, frames))

    label_w = 130
    sheet_w = label_w + max(
        sum(f.width for f in frames) + GUTTER * len(frames) for _, frames in rows
    )
    sheet_h = sum(max(f.height for f in frames) + GUTTER for _, frames in rows)

    sheet = Image.new("RGB", (sheet_w, sheet_h), "#4b4b4b")
    draw = ImageDraw.Draw(sheet)

    y = 0
    for name, frames in rows:
        row_h = max(f.height for f in frames)
        draw.text((8, y + row_h // 2 - 6), name, fill="#ffffff")
        x = label_w
        for index, frame in enumerate(frames):
            sheet.paste(frame, (x, y + (row_h - frame.height) // 2))
            draw.text((x + 2, y), LABELS[index] if index < len(LABELS) else "", fill="#ffe08a")
            x += frame.width + GUTTER
        y += row_h + GUTTER

    path = OUT / "compare" / "buttons.png"
    sheet.save(path)
    print(path, sheet.size)


if __name__ == "__main__":
    main()
