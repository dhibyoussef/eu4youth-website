"""Generate public/sitemap.xml from canonical static and source-backed detail routes."""

from __future__ import annotations

import re
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://eu4youth.org"

STATIC_ROUTES = [
    "/",
    "/programme/a-propos",
    "/programme/objectifs",
    "/programme/financement",
    "/programme/gouvernance",
    "/projets",
    "/carte",
    "/opportunites",
    "/actualites",
    "/publications",
    "/glossaire",
    "/contact",
    "/agenda",
    "/partenaires",
    "/mecanismes-appui",
    "/eu-en-tunisie",
    "/coin-media",
]


def values(path: Path, field: str) -> list[str]:
    source = path.read_text(encoding="utf-8")
    return list(dict.fromkeys(re.findall(rf"\b{field}:\s*'([^']+)'", source)))


def public_publication_ids(path: Path) -> list[str]:
    source = path.read_text(encoding="utf-8")
    corpus = source.split("const PUBLICATION_CORPUS", 1)[1].split(
        "/** Documents explicitly marked as drafts", 1
    )[0]
    blocks = re.split(r"\n\s{2}\{\n", corpus)[1:]
    result: list[str] = []
    for block in blocks:
        match = re.search(r"\bid:\s*'([^']+)'", block)
        if not match or re.search(r"\b(?:draft|brouillon)\b", block, re.IGNORECASE):
            continue
        result.append(match.group(1))
    return result


def main() -> None:
    data = ROOT / "src" / "data"
    routes = [
        *STATIC_ROUTES,
        *(f"/projets/{slug}" for slug in values(data / "projects.ts", "slug")),
        *(
            f"/opportunites/{slug}"
            for slug in values(data / "opportunities.ts", "slug")
        ),
        *(f"/actualites/{slug}" for slug in values(data / "news.ts", "slug")),
        *(
            f"/publications/{identifier}"
            for identifier in public_publication_ids(data / "publications.ts")
        ),
        *(f"/agenda/{identifier}" for identifier in values(data / "events.ts", "id")),
    ]
    routes = list(dict.fromkeys(routes))

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for route in routes:
        priority = "1.0" if route == "/" else "0.7"
        changefreq = "weekly" if route in {"/", "/actualites", "/opportunites", "/agenda"} else "monthly"
        lines.append(
            f"  <url><loc>{escape(ORIGIN + route)}</loc>"
            f"<changefreq>{changefreq}</changefreq>"
            f"<priority>{priority}</priority></url>"
        )
    lines.append("</urlset>")
    (ROOT / "public" / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(routes)} sitemap routes")


if __name__ == "__main__":
    main()
