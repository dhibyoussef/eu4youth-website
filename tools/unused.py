"""Report image files no longer referenced anywhere in the source.

Bands have moved from being served as flattened crops of the comp to being drawn
in CSS, and each move leaves its plate behind in public/. Nothing fails when that
happens, so the only sign is the byte weight of a folder nobody reads.

Usage: python tools/unused.py
"""

import re
from pathlib import Path

SOURCE_SUFFIXES = {'.tsx', '.ts', '.css', '.html'}

# Some paths are built rather than written out — the project logos are requested as
# `/img/logo-${cell.slug}-grey.png` — so a plain substring search reports a dozen
# files in use as dead. Every interpolation becomes a wildcard instead.
REFERENCE = re.compile(r'/img/([A-Za-z0-9._${}\-]+)')
INTERPOLATION = re.compile(r'\$\{[^}]*\}')


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    haystack = ' '.join(
        path.read_text(encoding='utf-8', errors='ignore')
        for path in list(root.glob('src/**/*')) + [root / 'index.html']
        if path.is_file() and path.suffix in SOURCE_SUFFIXES
    )

    patterns = []
    for reference in set(REFERENCE.findall(haystack)):
        escaped = re.escape(reference).replace(r'\$\{', '${')
        patterns.append(
            re.compile('^' + INTERPOLATION.sub('[^/]+', escaped) + '$')
        )

    unused = [
        path
        for path in sorted((root / 'public/img').glob('*'))
        if path.is_file() and not any(p.match(path.name) for p in patterns)
    ]

    total = sum(path.stat().st_size for path in unused)
    print(f'{len(unused)} image files are not referenced anywhere in src/')
    for path in unused:
        print(f'  {path.name:<30}{path.stat().st_size / 1024:7.0f} KB')
    print(f'  {"":<30}{"-" * 7}')
    print(f'  {"total":<30}{total / 1024:7.0f} KB')


if __name__ == '__main__':
    main()
