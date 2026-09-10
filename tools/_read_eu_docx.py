from __future__ import annotations

import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def extract_docx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    parts: list[str] = []
    for paragraph in root.findall(".//w:p", NS):
        texts = [node.text or "" for node in paragraph.findall(".//w:t", NS)]
        line = "".join(texts).strip()
        if line:
            parts.append(line)
    return "\n".join(parts)


def main() -> None:
    root = Path(
        r"C:\Users\youss\OneDrive\Attachments\Desktop\fi2t-live-editor\EU4Youth\EU4Youth"
    )
    matches = [
        path
        for path in root.iterdir()
        if path.suffix.lower() == ".docx" and "Union" in path.name and "Tunisie" in path.name
    ]
    out = Path(__file__).resolve().parent / "out" / "eu-tunisie-docx.txt"
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = {"matches": [str(path) for path in matches], "text": ""}
    if matches:
        payload["text"] = extract_docx_text(matches[0])
        out.write_text(payload["text"], encoding="utf-8")
    (out.with_suffix(".json")).write_text(
        json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
