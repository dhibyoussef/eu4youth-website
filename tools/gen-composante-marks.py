from pathlib import Path

out = Path(__file__).resolve().parents[1] / "public" / "img"
out.mkdir(parents=True, exist_ok=True)


def svg_mark(filename: str, top: str, main: str, circle_text: str, bottom: str, accent: str) -> None:
    w, h = 420, 200
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" fill="none">
  <circle cx="28" cy="28" r="7" fill="#1e88e5"/>
  <circle cx="52" cy="28" r="7" fill="#e34171"/>
  <circle cx="76" cy="28" r="7" fill="#f2a849"/>
  <circle cx="100" cy="28" r="7" fill="#58ac48"/>
  <text x="24" y="72" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="{accent}" letter-spacing="1">{top}</text>
  <text x="24" y="118" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="700" fill="#111111">{main}</text>
  <circle cx="340" cy="100" r="52" fill="{accent}"/>
  <text x="340" y="112" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800" fill="#ffffff">{circle_text}</text>
  <text x="24" y="168" font-family="Georgia, 'Times New Roman', serif" font-size="15" font-weight="600" fill="#222222" letter-spacing="1.2">{bottom}</text>
</svg>
"""
    path = out / filename
    path.write_text(svg, encoding="utf-8")
    print("wrote", path.name)


marks = [
    ("composante-limitless-generation.svg", "CLUB", "Limitl'", "ESS", "GÉNÉRATION", "#e85c0d"),
    ("composante-go4-chercheurs.svg", "GO4YOUTH", "Chercheurs", "EMP", "D'EMPLOI", "#23b5e5"),
    ("composante-go4-entreprises.svg", "GO4YOUTH", "Entreprises", "ANETI", "EMPLOYEURS", "#23b5e5"),
    ("composante-go4-digitale.svg", "GO4YOUTH", "Digitale", "ANETI", "TRANSFORM", "#23b5e5"),
    ("composante-go4-ecosysteme.svg", "GO4YOUTH", "Écosystème", "EMP", "EMPLOYABILITÉ", "#23b5e5"),
    ("composante-swafy-mobidoc.svg", "SWAFY", "MOBIDOC", "DOC", "BOURSES", "#705fa7"),
    ("composante-swafy-creative.svg", "SWAFY", "Créative", "JC", "JEUNESSE", "#705fa7"),
    ("composante-swafy-debat.svg", "SWAFY", "Débat", "STI", "JEUNESSE-SCIENCE", "#705fa7"),
    ("composante-irada-appels.svg", "IRADA4YOUTH", "Appels", "AAP", "RÉGIONAUX", "#f2a849"),
    ("composante-irada-suivi.svg", "IRADA4YOUTH", "Suivi", "SEL", "SÉLECTION", "#f2a849"),
    ("composante-irada-ecosysteme.svg", "IRADA4YOUTH", "Écosystème", "REG", "RÉGIONAL", "#f2a849"),
    ("composante-magh-services.svg", "MAGHROUM'IN", "Services", "PUB", "PUBLICS", "#54b84f"),
    ("composante-magh-dynamiques.svg", "MAGHROUM'IN", "Dynamiques", "COM", "COMMUNAUTAIRES", "#54b84f"),
    ("composante-magh-inclusion.svg", "MAGHROUM'IN", "Inclusion", "ECO", "ÉCONOMIQUE", "#54b84f"),
    ("composante-fe3ila-gouvernance.svg", "FE3IL.A", "Gouvernance", "LOC", "AVEC LES JEUNES", "#050b86"),
    ("composante-fe3ila-entrepreneuriat.svg", "FE3IL.A", "Initiatives", "JEUN", "ENTREPRENEURIAT", "#050b86"),
    ("composante-fe3ila-engagement.svg", "FE3IL.A", "Engagement", "ASS", "CITOYEN", "#050b86"),
    ("composante-fe3ila-espaces.svg", "FE3IL.A", "Espaces", "JEUN", "ADAPTÉS", "#050b86"),
]

for args in marks:
    svg_mark(*args)
