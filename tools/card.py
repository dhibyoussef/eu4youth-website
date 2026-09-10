"""Find the pale card behind the POURQUOI photograph."""

from pathlib import Path

import pymupdf

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design' / 'a propos.pdf')

page = pymupdf.open(SRC)[0]
for drawing in page.get_drawings():
    rect = drawing['rect']
    if rect.width < 800 or rect.height < 1000:
        continue
    if not (1300 < rect.y0 < 1600):
        continue
    print(f'x={rect.x0:.1f}-{rect.x1:.1f}  y={rect.y0:.1f}-{rect.y1:.1f}  '
          f'w={rect.width:.1f} h={rect.height:.1f}  fill={drawing.get("fill")}')
