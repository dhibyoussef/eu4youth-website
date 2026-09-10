"""Print geometry for a page in reading order, to derive exact CSS values.

Usage:
  python tools/inspect.py Accueil-p1               # all spans
  python tools/inspect.py Accueil-p1 0 1200        # spans within a y-range
  python tools/inspect.py Accueil-p1 0 1200 rects  # big rects in that y-range
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

OUT = Path.home() / "AppData" / "Local" / "Temp" / "eu4youth-extract"


def main() -> None:
    tag = sys.argv[1]
    y0 = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
    y1 = float(sys.argv[3]) if len(sys.argv) > 3 else 1e9
    mode = sys.argv[4] if len(sys.argv) > 4 else "spans"

    data = json.loads((OUT / "geometry" / f"{tag}.json").read_text(encoding="utf-8"))
    print(f"# {tag}  canvas {data['width']:.0f} x {data['height']:.0f}\n")

    if mode == "spans":
        rows = [s for s in data["spans"] if y0 <= s["y"] <= y1]
        rows.sort(key=lambda s: (round(s["y"]), s["x"]))
        print(f"{'y':>7} {'x':>7} {'w':>6} {'size':>6} {'color':>8}  font / text")
        for s in rows:
            font = (s["font"] or "").split("+")[-1][:22]
            print(
                f"{s['y']:>7.1f} {s['x']:>7.1f} {s['w']:>6.1f} {s['size']:>6.2f} "
                f"{s['color'] or '':>8}  {font:<22} {s['text'][:58]!r}"
            )

    elif mode == "rects":
        rows = [r for r in data["rects"] if y0 <= r["y"] <= y1 and r["area"] > 4000]
        rows.sort(key=lambda r: (round(r["y"]), r["x"]))
        print(f"{'y':>7} {'x':>7} {'w':>7} {'h':>7} {'fill':>8} {'stroke':>8}")
        for r in rows:
            print(
                f"{r['y']:>7.1f} {r['x']:>7.1f} {r['w']:>7.1f} {r['h']:>7.1f} "
                f"{r['fill'] or '':>8} {r['stroke'] or '':>8}"
            )

    elif mode == "bands":
        rows = [r for r in data["rects"] if r["w"] > 900]
        rows.sort(key=lambda r: round(r["y"]))
        print(f"{'y':>8} {'yEnd':>8} {'x':>8} {'w':>8} {'h':>8} {'fill':>8}")
        for r in rows:
            print(
                f"{r['y']:>8.1f} {r['y'] + r['h']:>8.1f} {r['x']:>8.1f} "
                f"{r['w']:>8.1f} {r['h']:>8.1f} {r['fill'] or '':>8}"
            )

    elif mode == "images":
        rows = [i for i in data["images"] if y0 <= i["y"] <= y1]
        rows.sort(key=lambda i: (round(i["y"]), i["x"]))
        print(f"{'y':>7} {'x':>7} {'w':>7} {'h':>7} {'xref':>7}")
        for i in rows:
            print(
                f"{i['y']:>7.1f} {i['x']:>7.1f} {i['w']:>7.1f} {i['h']:>7.1f} "
                f"{i['xref'] or '':>7}"
            )


if __name__ == "__main__":
    main()
