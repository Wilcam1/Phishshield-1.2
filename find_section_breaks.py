import docx

doc = docx.Document("Plantilla trabajo de grado 12 - v2.docx")

# Let's find which paragraph has the sectPr
for i, p in enumerate(doc.paragraphs):
    pPr = p._element.pPr
    if pPr is not None and pPr.sectPr is not None:
        txt = p.text.strip()[:40]
        print(f"Paragraph P{i:03d} ends a section. Text: {repr(txt)}")
