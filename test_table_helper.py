import os
import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def style_table_cells(table, headers, data, col_widths, alt_shading=True):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'  <w:left w:val="none"/>'
            f'  <w:right w:val="none"/>'
            f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'  <w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr[0].append(borders)

    # Format header
    hdr = table.rows[0]
    hdr_trPr = hdr._element.get_or_add_trPr()
    hdr_trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    hdr_trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        cell.text = h
        tcPr = cell._element.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="1E3A8A"/>')
        tcPr.append(shd)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        for r in p.runs:
            r.font.name = 'Cambria'
            r.font.bold = True
            r.font.size = Pt(9.0)
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # Format data rows
    for r_idx, row_values in enumerate(data, start=1):
        row = table.rows[r_idx]
        r_trPr = row._element.get_or_add_trPr()
        r_trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        bg = "F8FAFC" if (r_idx % 2 == 0 and alt_shading) else "FFFFFF"
        for c_idx, val in enumerate(row_values):
            cell = row.cells[c_idx]
            cell.text = str(val)
            tcPr = cell._element.get_or_add_tcPr()
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg}"/>')
            tcPr.append(shd)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            if c_idx == 0 and len(str(val)) <= 15:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Cambria'
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    for row in table.rows:
        for idx, w in enumerate(col_widths):
            row.cells[idx].width = w

print("Table helper defined.")
