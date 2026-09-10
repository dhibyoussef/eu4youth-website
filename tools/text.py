"""Dump a band's text spans verbatim, so build copy can be diffed against the comp.

probe.py truncates long spans, which hides the very things that shift justified
type: a curly versus straight apostrophe, a non-breaking space, a hair space
before a colon. This prints each span's exact characters with its metrics.

Usage:  python tools/text.py <pdf stem> <page> <y0> <y1>
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

SRC = Path(
    r"C:\Users\youss\OneDrive\Attachments\Desktop\EU4Youth"
    r"\UI Web Design-20260807T094637Z-1-001\UI Web Design"
)


def main() -> None:
    stem, page_no = sys.argv[1], int(sys.argv[2])
    y0, y1 = float(sys.argv[3]), float(sys.argv[4])

    page = pymupdf.open(SRC / f"{stem}.pdf")[page_no - 1]
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            if not (y0 <= line["bbox"][1] <= y1):
                continue
            for span in line["spans"]:
                left, top, right, _ = span["bbox"]
                print(
                    f"y={top:8.2f}  x={left:7.2f}  w={right - left:8.2f}"
                    f"  size={span['size']:6.2f}  {span['font']}"
                )
                print(f"    {span['text']!r}")
                oddities = {
                    character
                    for character in span["text"]
                    if ord(character) > 126 and not character.isalpha()
                }
                if oddities:
                    print(
                        "    non-ascii punctuation: "
                        + ", ".join(f"{c!r} U+{ord(c):04X}" for c in sorted(oddities))
                    )


if __name__ == "__main__":
    main()
