from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "tools" / "out" / "eu-tunisie-docx.txt"
TSX = ROOT / "src" / "pages" / "EuTunisiePage.tsx"


def parse_docx(path: Path) -> dict:
    lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    themes: list[dict[str, str]] = []
    index = 4
    while index < len(lines):
        title = lines[index]
        if title.startswith("Explorer les projets"):
            break
        themes.append({"title": title, "body": lines[index + 1]})
        index += 2
    return {
        "page_title": lines[0],
        "intro": [lines[1], lines[2]],
        "themes": themes,
        "explore_title": lines[index],
        "explore_body": lines[index + 1],
        "map_cta": "Explorer les projets de l’UE en Tunisie",
        "map_subtitle": "Cartographie des projets de l’Union européenne en Tunisie",
        "site_cta": "Découvrir l’action de l’UE en Tunisie",
        "site_subtitle": "Site officiel de l’Union européenne en Tunisie",
    }


def parse_site(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    intro_match = re.search(r"const INTRO_BODY =\n  \"(.*?)\"", text, re.S)
    intro = intro_match.group(1).replace("\\n\\n", "\n\n").split("\n\n") if intro_match else []
    themes = []
    for title, body in re.findall(
        r"title: '((?:\\'|[^'])*)',\s*body:\s*\n\s*'((?:\\'|[^'])*)'",
        text,
    ):
        themes.append(
            {
                "title": title.replace("\\'", "'"),
                "body": body.replace("\\'", "'"),
            }
        )
    return {
        "intro": intro,
        "themes": themes,
        "has_explore_title": "Explorer les projets de l’Union européenne en Tunisie" in text,
        "has_explore_body": "Ces thématiques prennent forme" in text,
        "map_cta": "Explorer les projets de l’UE en Tunisie" in text,
        "map_subtitle": "Cartographie des projets de l’Union européenne en Tunisie" in text,
        "site_cta": "Découvrir l’action de l’UE en Tunisie" in text,
        "site_subtitle": "Site officiel de l’Union européenne en Tunisie" in text,
    }


def main() -> None:
    docx = parse_docx(DOCX)
    site = parse_site(TSX)
    print("intro1_match", docx["intro"][0] == site["intro"][0])
    print("intro2_match", docx["intro"][1] == site["intro"][1])
    print("theme_count_docx", len(docx["themes"]))
    print("theme_count_site", len(site["themes"]))
    for index, (left, right) in enumerate(zip(docx["themes"], site["themes"]), start=1):
        if left != right:
            print(f"theme_{index}_title_match", left["title"] == right["title"])
            print(f"theme_{index}_body_match", left["body"] == right["body"])
    print("explore_title_on_site", site["has_explore_title"])
    print("explore_body_on_site", site["has_explore_body"])
    print("map_cta_on_site", site["map_cta"])
    print("map_subtitle_on_site", site["map_subtitle"])
    print("site_cta_on_site", site["site_cta"])
    print("site_subtitle_on_site", site["site_subtitle"])


if __name__ == "__main__":
    main()
