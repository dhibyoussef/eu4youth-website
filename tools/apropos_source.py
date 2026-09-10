"""Extract clean paragraphs from the à propos DOCX."""

from __future__ import annotations

import html
import re
import zipfile
from pathlib import Path

SRC = (
    Path(__file__).resolve().parents[2]
    / "EU4Youth"
    / "site web EU4Youth.org-20260811T205332Z-1-001"
    / "site web EU4Youth.org"
    / "Le programme EU4Youth"
    / "eu4youth à propos.docx"
)
OUT = Path(__file__).resolve().parent / "out" / "apropos-source.txt"


def main() -> None:
    with zipfile.ZipFile(SRC) as archive:
        xml = archive.read("word/document.xml").decode("utf-8")

    paragraphs: list[str] = []
    for para in re.split(r"</w:p>", xml):
        runs = re.findall(r"<w:t[^>]*>(.*?)</w:t>", para)
        if not runs:
            continue
        line = html.unescape("".join(runs))
        line = re.sub(r"<[^>]+>", "", line)
        line = re.sub(r"\s+", " ", line).strip()
        if line:
            paragraphs.append(line)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(paragraphs), encoding="utf-8")
    print(f"wrote {OUT} ({len(paragraphs)} paragraphs)")


if __name__ == "__main__":
    main()
