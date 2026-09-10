"""Lift a piece of the comp's vector art out of the PDF as SVG path data.

Artwork that the comp draws with paths — the dashed disc that bleeds off the right edge, for
one — has been reaching the build as a bitmap cropped out of a rendered page. That is why it
softens at any zoom and why its dash rhythm never quite matched: it was a photograph of a
drawing. The drawing itself is in the file, so this reads its curves and writes them out as
path data, to be inlined and coloured from CSS like anything else on the page.

Coordinates are emitted relative to the union of the selected paths, so the result drops into
a viewBox starting at 0,0; the caller is told what that box was in page coordinates so it can
be placed.

Usage: python tools/svgart.py X0 Y0 X1 Y1 [OUT.svg]
       selects every path whose bbox centre falls in that rectangle
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

PDF = (
    Path(__file__).resolve().parents[2]
    / 'EU4Youth'
    / 'UI Web Design-20260807T094637Z-1-001'
    / 'UI Web Design'
    / 'a propos.pdf'
)


def rgb(colour) -> str:
    if colour is None:
        return 'none'
    return '#' + ''.join(f'{round(c * 255):02x}' for c in colour)


def path_data(items, ox: float, oy: float, places: int = 2) -> str:
    """PDF path items as an SVG `d`, shifted by the art's own origin."""

    def pt(p) -> str:
        return f'{round(p.x - ox, places):g} {round(p.y - oy, places):g}'

    out: list[str] = []
    here = None
    for item in items:
        kind = item[0]
        if kind == 'l':
            start, end = item[1], item[2]
            if here != start:
                out.append(f'M{pt(start)}')
            out.append(f'L{pt(end)}')
            here = end
        elif kind == 'c':
            start, c1, c2, end = item[1], item[2], item[3], item[4]
            if here != start:
                out.append(f'M{pt(start)}')
            out.append(f'C{pt(c1)} {pt(c2)} {pt(end)}')
            here = end
        elif kind == 're':
            rect, = item[1:2]
            out.append(
                f'M{round(rect.x0 - ox, places):g} {round(rect.y0 - oy, places):g}'
                f'h{round(rect.width, places):g}v{round(rect.height, places):g}'
                f'h{round(-rect.width, places):g}Z'
            )
            here = None
        elif kind == 'qu':
            quad = item[1]
            corners = [quad.ul, quad.ur, quad.lr, quad.ll]
            out.append('M' + pt(corners[0]) + ''.join('L' + pt(c) for c in corners[1:]) + 'Z')
            here = None
    return ' '.join(out)


def main() -> None:
    x0, y0, x1, y1 = (float(v) for v in sys.argv[1:5])
    out_name = sys.argv[5] if len(sys.argv) > 5 else None

    with pymupdf.open(PDF) as doc:
        page = doc[0]
        chosen = []
        for drawing in page.get_drawings():
            rect = drawing['rect']
            cx, cy = (rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2
            if x0 <= cx <= x1 and y0 <= cy <= y1:
                chosen.append(drawing)

    if not chosen:
        print('nothing selected')
        return

    box = chosen[0]['rect']
    for drawing in chosen[1:]:
        box |= drawing['rect']

    print(f'{len(chosen)} paths')
    print(f'art box  x {box.x0:.1f}..{box.x1:.1f}  y {box.y0:.1f}..{box.y1:.1f}')
    print(f'         {box.width:.1f} x {box.height:.1f}')

    parts = []
    for drawing in chosen:
        d = path_data(drawing['items'], box.x0, box.y0)
        if not d:
            continue
        fill = rgb(drawing['fill'])
        stroke = rgb(drawing['color'])
        attrs = f'fill="{fill}"'
        if stroke != 'none' and (drawing.get('width') or 0) > 0:
            attrs += f' stroke="{stroke}" stroke-width="{drawing["width"]:.2f}"'
        parts.append(f'  <path {attrs} d="{d}" />')
        print(
            f'  path  fill {fill}  items {len(drawing["items"])}'
            f'  bbox {drawing["rect"].width:.1f}x{drawing["rect"].height:.1f}'
            f'  d {len(d)} chars'
        )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '
        f'{box.width:.2f} {box.height:.2f}">\n' + '\n'.join(parts) + '\n</svg>\n'
    )

    if out_name:
        target = Path(__file__).resolve().parents[1] / out_name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(svg, encoding='utf-8')
        print(f'\nwrote {out_name}  ({len(svg)} bytes)')
    else:
        print('\n' + svg)


if __name__ == '__main__':
    main()
