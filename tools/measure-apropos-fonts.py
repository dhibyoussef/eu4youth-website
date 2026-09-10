import pymupdf

pdf = pymupdf.open(
    r"c:\Users\youss\OneDrive\Attachments\Desktop\fi2t-live-editor\EU4Youth\EU4Youth\UI Web Design-20260807T094637Z-1-001\UI Web Design\a propos.pdf"
)

def sample_fonts(page, label, y0=None, y1=None):
    d = page.get_text("dict")
    rows = []
    for b in d["blocks"]:
        if b.get("type") != 0:
            continue
        for line in b.get("lines", []):
            for span in line.get("spans", []):
                y = span["bbox"][1]
                if y0 is not None and y < y0:
                    continue
                if y1 is not None and y > y1:
                    continue
                text = span["text"].strip()
                if not text or len(text) < 3:
                    continue
                rows.append((round(span["size"], 1), round(y), text[:70]))
    rows.sort(key=lambda r: r[1])
    print("\n===", label, "===")
    seen = set()
    for size, y, text in rows:
        key = (size, text[:24])
        if key in seen:
            continue
        seen.add(key)
        print(f"  {size:5.1f}px  y={y:5d}  {text}")
        if len(seen) > 35:
            break

page = pdf[0]
# Pourquoi band ~1350-3048
sample_fonts(page, "pourquoi", 1350, 3050)
# Vision ~3048-4200
sample_fonts(page, "vision", 3048, 4200)
# Territoires ~6966-8200
sample_fonts(page, "territoires", 6960, 8300)
# Partners EU ~9800-11000
sample_fonts(page, "partners", 9800, 11200)

# Page 1 territoires dedicated
sample_fonts(pdf[1], "territoires-p1")
