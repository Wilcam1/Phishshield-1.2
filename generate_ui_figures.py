import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def save_fig(fig, filename):
    filepath = os.path.join("generated_figures", filename)
    fig.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Generated: {filepath}")

# 7. Figura 4-1: Interfaz de usuario interactiva y Asistente Educativo con IA
fig, ax = plt.subplots(figsize=(10, 6.0), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 7)
ax.axis('off')

# Window container
window = patches.FancyBboxPatch((0.2, 0.2), 9.6, 6.4, boxstyle="round,pad=0.1", facecolor="#F8FAFC", edgecolor="#CBD5E1", lw=2)
ax.add_patch(window)

# Top Bar
header = patches.Rectangle((0.2, 5.8), 9.6, 0.8, facecolor="#1E3A8A")
ax.add_patch(header)
ax.text(0.6, 6.2, "[ESCUDO] PhishShield — Verificador Inteligente de URLs", color="#FFFFFF", fontsize=11, fontweight='bold', va='center')
ax.text(8.8, 6.2, "[Admin SOC]   [Modo Oscuro]", color="#93C5FD", fontsize=8.5, va='center')

# Input Bar
input_box = patches.FancyBboxPatch((0.8, 5.0), 6.5, 0.55, boxstyle="round,pad=0.05", facecolor="#FFFFFF", edgecolor="#3B82F6", lw=1.5)
ax.add_patch(input_box)
ax.text(1.0, 5.27, "https://bancolombia-login-secure.xyz/verify", color="#1E293B", fontsize=9, va='center', family='monospace')

btn_analizar = patches.FancyBboxPatch((7.5, 5.0), 1.7, 0.55, boxstyle="round,pad=0.05", facecolor="#2563EB", edgecolor="#1D4ED8", lw=1)
ax.add_patch(btn_analizar)
ax.text(8.35, 5.27, "Analizar URL", color="#FFFFFF", fontsize=9, fontweight='bold', ha='center', va='center')

# Result Card
card_result = patches.FancyBboxPatch((0.8, 0.6), 8.4, 4.1, boxstyle="round,pad=0.1", facecolor="#FFFFFF", edgecolor="#E2E8F0", lw=1.5)
ax.add_patch(card_result)

# Badge Riesgo Alto
badge_alto = patches.FancyBboxPatch((1.2, 3.8), 2.8, 0.65, boxstyle="round,pad=0.05", facecolor="#FEE2E2", edgecolor="#DC2626", lw=2)
ax.add_patch(badge_alto)
ax.text(2.6, 4.12, "RIESGO ALTO (10/10)", color="#991B1B", fontsize=9.5, fontweight='bold', ha='center', va='center')

ax.text(4.4, 4.12, "Probabilidad ML: 100% | Entropia: 4.12 bits/char | SSL: < 24h", color="#475569", fontsize=8.5, va='center', fontweight='bold')

# AI Box
ai_box = patches.FancyBboxPatch((1.2, 2.3), 7.6, 1.3, boxstyle="round,pad=0.1", facecolor="#EFF6FF", edgecolor="#60A5FA", lw=1.5)
ax.add_patch(ai_box)
ax.text(1.5, 3.25, "[Asistente IA] Explicacion Pedagogica:", color="#1E3A8A", fontsize=9, fontweight='bold')
ax.text(1.5, 2.7, "Esta pagina intenta suplantar al portal bancario legítimo. Se detecto combosquatting con el\ntermino 'bancolombia' en un dominio no oficial (.xyz), certificado recien creado y campo de password sospechoso.", color="#1E293B", fontsize=8)

# Micro-quiz
quiz_box = patches.FancyBboxPatch((1.2, 0.8), 7.6, 1.3, boxstyle="round,pad=0.1", facecolor="#FEF3C7", edgecolor="#F59E0B", lw=1.5)
ax.add_patch(quiz_box)
ax.text(1.5, 1.75, "[Micro-Quiz (30 seg)] ¿Por que este enlace es peligroso?", color="#B45309", fontsize=9, fontweight='bold')
ax.text(1.5, 1.35, "A) Porque usa .xyz e imita a Bancolombia sin ser oficial (Respuesta Correcta)", color="#047857", fontsize=8, fontweight='bold')
ax.text(1.5, 1.0, "B) Porque cualquier pagina con HTTPS es un fraude | C) Porque la URL tiene mas de 10 letras", color="#475569", fontsize=7.5)

plt.title("Figura 4-1: Interfaz de Usuario de PhishShield, Veredicto de Riesgo y Asistente Educativo con IA", fontsize=11, fontweight='bold', pad=10, color="#1E3A8A")
save_fig(fig, "figura_4_1.png")

# 8. Figura 4-2: Consola SOC
fig, ax = plt.subplots(figsize=(10, 5.8), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

# Window
win = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.6, boxstyle="round,pad=0.1", facecolor="#0F172A", edgecolor="#334155", lw=2)
ax.add_patch(win)

# Header
ax.text(0.6, 5.3, "PANEL ADMINISTRATIVO SOC — TELEMETRIA DE AMENAZAS", color="#38BDF8", fontsize=10.5, fontweight='bold')
ax.text(8.2, 5.3, "[Exportar CSV]  [JSON]", color="#94A3B8", fontsize=8.5, fontweight='bold')

# KPI Cards
kpis = [
    (0.6, 4.0, 2.0, 0.9, "Total Analisis\n1,248", "#1E293B", "#38BDF8"),
    (2.9, 4.0, 2.0, 0.9, "Riesgo Alto\n412 (33%)", "#1E293B", "#EF4444"),
    (5.2, 4.0, 2.0, 0.9, "Riesgo Medio\n185 (15%)", "#1E293B", "#F59E0B"),
    (7.5, 4.0, 2.0, 0.9, "Sitios Limpios\n651 (52%)", "#1E293B", "#10B981")
]
for kx, ky, kw, kh, ktext, kfc, kec in kpis:
    kr = patches.FancyBboxPatch((kx, ky), kw, kh, boxstyle="round,pad=0.1", facecolor=kfc, edgecolor=kec, lw=1.5)
    ax.add_patch(kr)
    ax.text(kx + kw/2, ky + kh/2, ktext, color="#F8FAFC", fontsize=8.5, fontweight='bold', ha='center', va='center')

# Table mockup
tbl_box = patches.FancyBboxPatch((0.6, 0.5), 8.9, 3.2, boxstyle="round,pad=0.1", facecolor="#1E293B", edgecolor="#475569", lw=1.5)
ax.add_patch(tbl_box)
ax.text(0.9, 3.3, "TIMESTAMP            URL AUDITADA                          RIESGO    PUNTAJE   ML PROB   ACCION", color="#94A3B8", fontsize=7.5, family='monospace', fontweight='bold')
rows = [
    ("2024-04-20 14:22:10  bancolombia-login-secure.xyz          ALTO      10/10     100.0%    [Eliminar FP]", "#FCA5A5"),
    ("2024-04-20 14:19:45  bancolornbia.com (Typosquatting)      ALTO       8/10      84.2%    [Eliminar FP]", "#FCA5A5"),
    ("2024-04-20 14:05:02  http://192.168.1.1/login              MEDIO      5/10      48.0%    [Eliminar FP]", "#FDE68A"),
    ("2024-04-20 13:58:11  google.com                            BAJO       0/10       2.1%    [Eliminar FP]", "#86EFAC"),
    ("2024-04-20 13:42:30  davivienda.com                        BAJO       0/10       1.8%    [Eliminar FP]", "#86EFAC")
]
for idx, (rtxt, rcol) in enumerate(rows):
    ax.text(0.9, 2.8 - idx*0.5, rtxt, color=rcol, fontsize=7.2, family='monospace')

plt.title("Figura 4-2: Consola Administrativa SOC con Métricas Operativas y Tabla de Auditoría Forense", fontsize=11, fontweight='bold', pad=10, color="#1E3A8A")
save_fig(fig, "figura_4_2.png")

print("Figures 4-1 and 4-2 generated successfully.")
