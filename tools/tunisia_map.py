"""Build the interactive map's geometry: all 24 governorates, as SVG paths.

The map first shipped as bitmaps cropped out of the comp, then as the comp's own vector paths.
Both were incomplete: the artwork draws 23 governorates, merging Ariana into its neighbours,
and it simplifies coastlines to the point where Kerkennah and Djerba are loose specks. A map
that is missing a governorate cannot answer "which governorates does this project work in".

So the geometry comes from geoBoundaries ADM1 (gbOpen, CC BY 4.0) instead, projected into the
same 420 x 887 box the comp draws its map in, so the card's layout and the CSS around it are
untouched. Names are the French ones the project data uses.

Usage: python tools/tunisia_map.py [--fetch] [--preview]
       --fetch    re-download the source geometry into tools/data/
       --preview  write a numbered/named PNG to tools/out/
"""

from __future__ import annotations

import json
import math
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tools' / 'data' / 'tun-adm1.geojson'
TARGET = ROOT / 'src' / 'data' / 'tunisia.ts'
GEOJSON_URL = (
    'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/'
    'TUN/ADM1/geoBoundaries-TUN-ADM1_simplified.geojson'
)

# The comp's map box, so this drops into the CSS that already places it.
BOX_W, BOX_H = 420.0, 887.0

# geoBoundaries' shapeName -> the spelling the project data and the comps use.
FRENCH = {
    'El Kef': 'Le Kef',
    'Manouba': 'Manouba',
    'Zaghouan': 'Zaghouan',
}

# Governorates too small to letter on the shape at the comp's 12px. Their names would spill
# across three neighbours, so the map leaves them to the readout line under it.
UNLABELLED = {'Tunis', 'Ariana', 'Ben Arous', 'Monastir'}


def fetch() -> None:
    SOURCE.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(GEOJSON_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=90) as response:
        SOURCE.write_bytes(response.read())
    print(f'fetched {SOURCE.name}  ({SOURCE.stat().st_size / 1024:.0f} KB)')


def rings(geometry) -> list[list[tuple[float, float]]]:
    """Every ring of a Polygon or MultiPolygon, as lon/lat pairs."""
    if geometry['type'] == 'Polygon':
        polygons = [geometry['coordinates']]
    else:
        polygons = geometry['coordinates']
    return [[(x, y) for x, y in ring] for polygon in polygons for ring in polygon]


def simplify(points: list[tuple[float, float]], tol: float) -> list[tuple[float, float]]:
    """Douglas-Peucker, so 24 coastlines fit in a file the browser should parse."""
    if len(points) < 3:
        return points

    start, end = points[0], points[-1]
    dx, dy = end[0] - start[0], end[1] - start[1]
    span = math.hypot(dx, dy)

    worst, index = -1.0, 0
    for i in range(1, len(points) - 1):
        px, py = points[i]
        if span == 0:
            distance = math.hypot(px - start[0], py - start[1])
        else:
            distance = abs(dy * (px - start[0]) - dx * (py - start[1])) / span
        if distance > worst:
            worst, index = distance, i

    if worst <= tol:
        return [start, end]
    return simplify(points[:index + 1], tol)[:-1] + simplify(points[index:], tol)


def inside(point: tuple[float, float], ring: list[tuple[float, float]]) -> bool:
    x, y = point
    hit = False
    for i in range(len(ring)):
        x0, y0 = ring[i]
        x1, y1 = ring[i - 1]
        if (y0 > y) != (y1 > y) and x < x0 + (y - y0) / (y1 - y0) * (x1 - x0):
            hit = not hit
    return hit


def edge_distance(point: tuple[float, float], ring: list[tuple[float, float]]) -> float:
    x, y = point
    best = float('inf')
    for i in range(len(ring)):
        x0, y0 = ring[i]
        x1, y1 = ring[i - 1]
        dx, dy = x1 - x0, y1 - y0
        span = dx * dx + dy * dy
        t = 0.0 if span == 0 else max(0.0, min(1.0, ((x - x0) * dx + (y - y0) * dy) / span))
        best = min(best, math.hypot(x - (x0 + t * dx), y - (y0 + t * dy)))
    return best


def label_point(ring: list[tuple[float, float]], steps: int = 44) -> tuple[float, float]:
    """The point inside a shape furthest from its own edges.

    A bbox centre or a centroid falls outside the concave ones — Nabeul wraps a gulf, Médenine
    wraps Djerba — and a name anchored there reads as belonging to the sea or to a neighbour.
    """
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    best, best_distance = ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2), -1.0
    for i in range(1, steps):
        for j in range(1, steps):
            candidate = (
                min(xs) + (max(xs) - min(xs)) * i / steps,
                min(ys) + (max(ys) - min(ys)) * j / steps,
            )
            if not inside(candidate, ring):
                continue
            distance = edge_distance(candidate, ring)
            if distance > best_distance:
                best, best_distance = candidate, distance
    return best


def build() -> list[dict]:
    features = json.loads(SOURCE.read_text(encoding='utf-8'))['features']

    # Equirectangular with a cosine correction at the country's mid-latitude: at Tunisia's size
    # the difference from a proper conic is under a pixel in this box, and it keeps the maths
    # readable. The scale is the one that fits the whole country inside the comp's box.
    everything = [p for f in features for ring in rings(f['geometry']) for p in ring]
    lons = [p[0] for p in everything]
    lats = [p[1] for p in everything]
    mid = math.radians((min(lats) + max(lats)) / 2)

    def flat(point: tuple[float, float]) -> tuple[float, float]:
        return point[0] * math.cos(mid), point[1]

    flat_points = [flat(p) for p in everything]
    x0, x1 = min(p[0] for p in flat_points), max(p[0] for p in flat_points)
    y0, y1 = min(p[1] for p in flat_points), max(p[1] for p in flat_points)
    scale = min(BOX_W / (x1 - x0), BOX_H / (y1 - y0))
    pad_x = (BOX_W - (x1 - x0) * scale) / 2
    pad_y = (BOX_H - (y1 - y0) * scale) / 2

    def project(point: tuple[float, float]) -> tuple[float, float]:
        fx, fy = flat(point)
        return (fx - x0) * scale + pad_x, BOX_H - ((fy - y0) * scale + pad_y)

    shapes = []
    for feature in features:
        raw = feature['properties']['shapeName']
        name = FRENCH.get(raw, raw)

        drawn = []
        for ring in rings(feature['geometry']):
            points = simplify([project(p) for p in ring], 0.35)
            if len(points) > 3:
                drawn.append(points)
        drawn.sort(key=lambda ring: -abs(sum(
            a[0] * b[1] - b[0] * a[1] for a, b in zip(ring, ring[1:] + ring[:1])
        )))

        d = ' '.join(
            'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in ring) + ' Z'
            for ring in drawn
        )
        cx, cy = label_point(drawn[0])
        shapes.append({
            'name': name,
            'label': name not in UNLABELLED,
            'cx': round(cx, 1),
            'cy': round(cy, 1),
            'd': d,
        })

    # North to south, so the drawing order is stable and readable in the diff.
    shapes.sort(key=lambda shape: shape['cy'])
    return shapes


def write(shapes: list[dict]) -> None:
    rows = [
        f"  {{ name: '{s['name']}', label: {'true' if s['label'] else 'false'}, "
        f"cx: {s['cx']}, cy: {s['cy']}, d: '{s['d']}' }},"
        for s in shapes
    ]
    body = (
        '/* Generated by tools/tunisia_map.py — do not hand-edit.\n'
        ' *\n'
        ' * All 24 governorates, from geoBoundaries ADM1 (gbOpen, CC BY 4.0), projected into the\n'
        " * 420 x 887 box the comp draws its map in. The comp's own artwork was tried first and\n"
        ' * is not usable as data: it draws 23 shapes, folding Ariana into its neighbours.\n'
        ' *\n'
        " * `cx`/`cy` is the point inside each shape furthest from its edges, so a name sits on\n"
        ' * the governorate it belongs to even where the shape wraps a gulf or an island. */\n\n'
        f"export const MAP_VIEWBOX = '0 0 {BOX_W:.0f} {BOX_H:.0f}'\n\n"
        'export interface MapShape {\n'
        '  name: string\n'
        '  /** The four around Tunis are too small to letter at the map\'s size. */\n'
        '  label: boolean\n'
        '  cx: number\n'
        '  cy: number\n'
        '  d: string\n'
        '}\n\n'
        'export const MAP_SHAPES: MapShape[] = [\n' + '\n'.join(rows) + '\n]\n'
    )
    TARGET.write_text(body, encoding='utf-8')
    print(f'wrote {TARGET.relative_to(ROOT)}  ({len(body) / 1024:.0f} KB)')


def preview(shapes: list[dict]) -> None:
    import pymupdf

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX_W:.0f} {BOX_H:.0f}" '
        f'width="{BOX_W:.0f}" height="{BOX_H:.0f}">',
        '<rect width="100%" height="100%" fill="#fff"/>',
    ]
    for shape in shapes:
        parts.append(f'<path d="{shape["d"]}" fill="#dcdcdd" stroke="#fff" stroke-width="1"/>')
    for shape in shapes:
        colour = '#e34171' if shape['label'] else '#0a3a67'
        parts.append(
            f'<text x="{shape["cx"]}" y="{shape["cy"]}" fill="{colour}" '
            f'font-family="monospace" font-size="11" font-weight="700" '
            f'text-anchor="middle">{shape["name"]}</text>'
        )
    parts.append('</svg>')

    svg = ROOT / 'tools' / 'out' / 'tunisia-map.svg'
    svg.parent.mkdir(parents=True, exist_ok=True)
    svg.write_text('\n'.join(parts), encoding='utf-8')
    with pymupdf.open(svg) as doc:
        png = svg.with_suffix('.png')
        doc[0].get_pixmap(matrix=pymupdf.Matrix(2, 2)).save(png)
    print(f'wrote {png.relative_to(ROOT)}')


def main() -> None:
    if '--fetch' in sys.argv or not SOURCE.exists():
        fetch()

    shapes = build()
    print(f'{len(shapes)} governorates')
    for shape in shapes:
        print(
            f'  {shape["name"]:<12} label {str(shape["label"]):<5}'
            f'  at {shape["cx"]:6.1f},{shape["cy"]:6.1f}  d {len(shape["d"])} chars'
        )

    write(shapes)
    if '--preview' in sys.argv:
        preview(shapes)


if __name__ == '__main__':
    main()
