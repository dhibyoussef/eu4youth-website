"""Corner radius of the POURQUOI pale card."""

from pathlib import Path

import pymupdf

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design' / 'a propos.pdf')

page = pymupdf.open(SRC)[0]
for drawing in page.get_drawings():
    rect = drawing['rect']
    if abs(rect.width - 905.3) > 2 or abs(rect.height - 1421.7) > 2:
        continue
    print('fill', drawing.get('fill'))
    print('items', len(drawing['items']))
    for item in drawing['items'][:8]:
        print(' ', item[0], item[1:] if len(item) > 1 else '')
