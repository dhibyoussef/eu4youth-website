"""List embedded fonts per PDF page, to confirm the real typefaces."""

from __future__ import annotations

from collections import Counter
from pathlib import Path

import pymupdf

SRC = Path(
    r"C:\Users\youss\OneDrive\Attachments\Desktop\EU4Youth"
    r"\UI Web Design-20260807T094637Z-1-001\UI Web Design"
)

usage: Counter[tuple[str, float]] = Counter()
fonts: Counter[str] = Counter()

for pdf in sorted(SRC.glob("*.pdf")):
    doc = pymupdf.open(pdf)
    for page in doc:
        for font in page.get_fonts(full=True):
            fonts[f"{font[3]}  type={font[2]}  enc={font[5]}"] += 1
        for block in page.get_text("dict").get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    if span.get("text", "").strip():
                        usage[(span["font"], round(span["size"]))] += 1

print("=== EMBEDDED FONT OBJECTS ===")
for name, count in fonts.most_common():
    print(f"{count:>5}  {name}")

print("\n=== FONT + SIZE USAGE (span count) ===")
for (name, size), count in sorted(usage.items(), key=lambda kv: -kv[1]):
    print(f"{count:>5}  {name:<28} {size}px")
