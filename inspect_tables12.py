import re

def detailed_inspection():
    with open("dump_plantilla_12.txt", "r", encoding="utf-8") as f:
        t12 = f.read()
        
    print("=== TABLES IN PLANTILLA 12 ===")
    table_blocks = t12.split("--- TABLE ")
    print(f"Total tables: {len(table_blocks) - 1}")
    for idx, tbl in enumerate(table_blocks[1:]):
        first_few_lines = tbl.split("\n")[:6]
        print(f"Table {idx}:")
        for l in first_few_lines:
            print("  ", l)

if __name__ == "__main__":
    detailed_inspection()
