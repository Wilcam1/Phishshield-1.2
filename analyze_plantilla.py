import re

def analyze_plantilla():
    with open("dump_plantilla_12.txt", "r", encoding="utf-8") as f:
        content = f.read()
        
    paragraphs = content.split("\n\n")
    print(f"Total blocks in dump_plantilla_12: {len(paragraphs)}")
    
    # Let's see the main sections
    current_sec = "INICIO"
    sec_summary = []
    
    for block in paragraphs:
        if block.startswith("[P"):
            lines = block.split("\n")
            meta = lines[0]
            text = "\n".join(lines[1:])
            
            # Check if it looks like a section header
            if any(k in meta for k in ["Títulos", "Heading", "Título"]):
                sec_summary.append((meta, text[:120]))
                
    for meta, text in sec_summary:
        print(f"{meta} --> {text}")

if __name__ == "__main__":
    analyze_plantilla()
