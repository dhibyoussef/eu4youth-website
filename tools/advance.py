"""Report the advance width the comp sets a given line at.

Pairing this with tools/weight.mjs settles which weight of a variable face the comp is
really using: the axis changes the advance, so the weight whose advance matches is the
weight the comp was drawn with, whatever the embedded font happens to be named.

Usage: python tools/advance.py "a propos" [page]
"""

import sys
from pathlib import Path

import pymupdf

SRC = (Path(__file__).resolve().parents[2] / 'EU4Youth'
       / 'UI Web Design-20260807T094637Z-1-001' / 'UI Web Design')

WANTED = {
    'UNE VISION COMMUNE',
    'POURQUOI',
    'EU4YOUTH ?',
    'SIX PROJETS',
    "L'AVENIR",
    'REGARDER VERS',
    "L'IMPACT DU PROGRAMME",
    'LES PARTENAIRES',
    'UNE ACTION DANS',
    'LES TERRITOIRES',
    'OBJECTIFS',
    'DU PROGRAMME',
    'COMMENT',
    'LE PROGRAMME AGIT',
}


def main() -> None:
    stem = sys.argv[1]
    page_no = int(sys.argv[2]) if len(sys.argv) > 2 else 1

    page = pymupdf.open(SRC / f'{stem}.pdf')[page_no - 1]

    seen: set[str] = set()
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block['lines']:
            text = ''.join(span['text'] for span in line['spans']).strip()
            if text not in WANTED or text in seen:
                continue
            seen.add(text)
            x0, _, x1, _ = line['bbox']
            span = line['spans'][0]
            print(f'{text:24s} advance={x1 - x0:7.1f}  size={span["size"]:5.1f}  '
                  f'#{span["color"]:06x}  {span["font"]}')


if __name__ == '__main__':
    main()
