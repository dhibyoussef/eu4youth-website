"""Measure the published PDFs and write their weight into the catalogue data.

The resource card is specified to show the file weight next to the format (UX brief
6.6), so the value has to come from the file actually served rather than from an
editorial estimate. Run this after adding or re-compressing a document.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "publications.ts"
PUBLIC = ROOT / "public"


def human(size: int) -> str:
    if size < 1024 * 1024:
        return f"{round(size / 1024)} Ko"
    return f"{size / 1024 / 1024:.1f}".replace(".", ",") + " Mo"


def main() -> None:
    source = DATA.read_text(encoding="utf8")
    missing: list[str] = []

    def patch(match: re.Match[str]) -> str:
        href = match.group("href")
        document = PUBLIC / href.lstrip("/")
        if not document.exists():
            missing.append(href)
            return match.group(0)
        weight = human(document.stat().st_size)
        print(f"{href} -> {weight}")
        return f"{match.group('line')}\n    fileSize: '{weight}',"

    patched, count = re.subn(
        r"(?P<line>    href: '(?P<href>[^']+)',)(\n    fileSize: '[^']*',)?",
        patch,
        source,
    )
    DATA.write_text(patched, encoding="utf8")
    print(f"{count} entries visited, {len(missing)} without a served file")
    for href in missing:
        print(f"  missing: {href}")


if __name__ == "__main__":
    main()
