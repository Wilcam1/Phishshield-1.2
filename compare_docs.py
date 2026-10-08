import re

def compare_docs():
    with open("dump_plantilla_12.txt", "r", encoding="utf-8") as f:
        text12 = f.read()
    with open("dump_proyecto_draft.txt", "r", encoding="utf-8") as f:
        text_draft = f.read()
        
    out = []
    out.append("================================================================================")
    out.append("COMPARATIVE DIAGNOSTIC OF BOTH DOCUMENTS")
    out.append("================================================================================\n")
    
    # 1. Analyze Plantilla 12
    out.append("--- 1. STRUCTURE AND STATUS OF 'Plantilla trabajo de grado 12.docx' ---")
    blocks12 = text12.split("\n\n")
    
    current_heading = "PORTADA"
    sections_map = {}
    for b in blocks12:
        m = re.match(r"\[P(\d+) \| Style: ([^\]]+)\]", b)
        if m:
            p_idx = int(m.group(1))
            style = m.group(2)
            lines = b.split("\n")
            body = "\n".join(lines[1:]).strip()
            if any(k in style for k in ["Títulos", "Heading", "Título"]):
                current_heading = body.split("\n")[0]
            if current_heading not in sections_map:
                sections_map[current_heading] = []
            sections_map[current_heading].append((p_idx, style, body))
            
    out.append(f"Detected main sections in Plantilla 12: {len(sections_map)}")
    for sec_name, items in sections_map.items():
        total_chars = sum(len(it[2]) for it in items)
        has_instruction = any("Diligenciar este espacio" in it[2] or "Su uso es opcional" in it[2] or "Esta sección es opcional" in it[2] or "El documento se debe escribir con interlineado" in it[2] for it in items)
        has_content = any(len(it[2]) > 100 for it in items)
        out.append(f"\nSECTION: '{sec_name}' | Paragraphs: {len(items)} | Total chars: {total_chars}")
        if has_instruction:
            out.append("  [!] Contains template instructions / placeholders.")
        # Sample text
        first_few = [it[2][:120].replace('\n', ' ') for it in items if len(it[2]) > 5][:2]
        for s in first_few:
            out.append(f"  Sample: {s}...")

    # Let's write output
    with open("comparative_analysis.txt", "w", encoding="utf-8") as f_out:
        f_out.write("\n".join(out))
    print("comparative_analysis.txt written successfully.")

if __name__ == "__main__":
    compare_docs()
