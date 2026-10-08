import re

def inspect_sections():
    with open("dump_plantilla_12.txt", "r", encoding="utf-8") as f:
        text = f.read()

    blocks = text.split("\n\n")
    
    # Let's inspect specific sections of interest:
    # 1. Portada / Preliminares (P000-P055)
    # 2. Introduccion (P130-P170)
    # 3. Objetivos (P171-P190)
    # 4. Alcances (P191-P218)
    # 5. Cronograma y Presupuesto (P219-P224)
    # 6. Marco Teorico y Metodologia (P225-P326)
    # 7. Analisis (P327-P406)
    # 8. Modelado / Diagramas (P407-P478)
    # 9. Implementacion y Pruebas (P479-P503)
    # 10. Conclusiones y Bibliografia (P504-P540)
    
    def print_range(start_idx, end_idx, title):
        print(f"\n{'='*30} {title} (P{start_idx}-P{end_idx}) {'='*30}")
        for b in blocks:
            m = re.match(r"\[P(\d+)", b)
            if m:
                p_num = int(m.group(1))
                if start_idx <= p_num <= end_idx:
                    lines = b.split("\n")
                    meta = lines[0]
                    body = "\n".join(lines[1:])
                    print(f"--- {meta} ---")
                    print(body[:300] + ("..." if len(body) > 300 else ""))

    print_range(0, 56, "PORTADA Y PRELIMINARES")
    print_range(130, 224, "INTRODUCCION HASTA PRESUPUESTO")
    print_range(225, 326, "MARCO TEORICO Y METODOLOGIA")
    print_range(327, 406, "ANALISIS DEL PROYECTO")
    print_range(407, 478, "DISEÑO Y DIAGRAMAS")
    print_range(479, 540, "IMPLEMENTACION, PRUEBAS Y CONCLUSIONES")

if __name__ == "__main__":
    inspect_sections()
