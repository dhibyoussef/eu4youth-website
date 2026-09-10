import pymupdf
import os

pdf = pymupdf.open(
    r"c:\Users\youss\OneDrive\Attachments\Desktop\fi2t-live-editor\EU4Youth\EU4Youth\UI Web Design-20260807T094637Z-1-001\UI Web Design\a propos.pdf"
)
out = r"c:\Users\youss\OneDrive\Attachments\Desktop\fi2t-live-editor\EU4Youth\eu4youth-website\public\img\_design"
os.makedirs(out, exist_ok=True)

page = pdf[0]
for term in ["POURQUOI", "UNE VISION", "UNE ACTION", "L'IMPACT", "LES PARTENAIRES", "L'UNION"]:
    hits = page.search_for(term)
    print(term, [(round(h.y0), round(h.y1)) for h in hits[:4]])

mat = pymupdf.Matrix(0.8, 0.8)

p1 = pdf[1]
pix = p1.get_pixmap(matrix=mat, alpha=False)
pix.save(os.path.join(out, "territoires.png"))
print("territoires", pix.width, pix.height)

p2 = pdf[2]
pix2 = p2.get_pixmap(matrix=mat, alpha=False)
pix2.save(os.path.join(out, "vision-objectifs.png"))
print("vision", pix2.width, pix2.height)

clip = pymupdf.Rect(0, 1300, 1920, 3200)
pix3 = page.get_pixmap(matrix=mat, clip=clip, alpha=False)
pix3.save(os.path.join(out, "pourquoi-vision.png"))
print("pourquoi-vision", pix3.width, pix3.height)

# Territoires band on full page — search UNE ACTION y
hits = page.search_for("UNE ACTION")
y = hits[0].y0 if hits else 6900
clip_t = pymupdf.Rect(0, y - 80, 1920, y + 1400)
pix_t = page.get_pixmap(matrix=mat, clip=clip_t, alpha=False)
pix_t.save(os.path.join(out, "territoires-full.png"))
print("territoires-full", pix_t.width, pix_t.height, "y", round(y))

# Partners / EU block
hits = page.search_for("LES PARTENAIRES")
y = hits[0].y0 if hits else 10500
clip_p = pymupdf.Rect(0, y - 40, 1920, y + 900)
pix_p = page.get_pixmap(matrix=mat, clip=clip_p, alpha=False)
pix_p.save(os.path.join(out, "partners-eu.png"))
print("partners", pix_p.width, pix_p.height, "y", round(y))
