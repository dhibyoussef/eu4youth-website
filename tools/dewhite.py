"""Drop white-filled paths from an SVG lifted out of the comp.

The comp's drawings carry a white copy of every coloured shape. In the PDF those copies do not
show — whatever holds them back, a clip or a soft mask, does not survive being read as plain path
data, so in the SVG they come out last and paint over the drawing, leaving a blank silhouette.
The bands they sit on are white, so removing them is the same picture.

Usage: python tools/dewhite.py FILE.svg
"""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> None:
    target = Path(sys.argv[1])
    lines = target.read_text(encoding='utf-8').splitlines()
    kept = [line for line in lines if 'fill="#ffffff"' not in line]
    target.write_text('\n'.join(kept) + '\n', encoding='utf-8')
    print(f'dropped {len(lines) - len(kept)} white paths, {target.stat().st_size} bytes left')


if __name__ == '__main__':
    main()
