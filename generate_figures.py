import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs("generated_figures", exist_ok=True)

def save_fig(fig, filename):
    filepath = os.path.join("generated_figures", filename)
    fig.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Generated: {filepath}")

# 1. Figura 1-1: Flujo de ataque de phishing bancario
fig, ax = plt.subplots(figsize=(10, 4.5), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 5)
ax.axis('off')

# Boxes
boxes = [
    (0.5, 3.2, 2.2, 1.2, "1. Vector de Ataque\nCorreo / SMS / WhatsApp\ncon enlace malicioso", "#FEF2F2", "#DC2626"),
    (3.8, 3.2, 2.4, 1.2, "2. Sitio Suplantador\nCombosquatting / IDN\nCertificado SSL reciente", "#FEF3C7", "#D97706"),
    (7.2, 3.2, 2.3, 1.2, "3. Robo de Datos\nFormulario falso captura\ncredenciales / tarjetas", "#FEE2E2", "#991B1B"),
    (3.8, 0.6, 2.4, 1.4, "4. Defensa PhishShield\nInspección Multicapa:\nML, DOM, SSL y Entropía", "#EFF6FF", "#1E3A8A"),
]

for x, y, w, h, text, facecolor, edgecolor in boxes:
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2", facecolor=facecolor, edgecolor=edgecolor, linewidth=2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=9, fontweight='bold', color="#1E293B")

# Arrows
arrowprops = dict(arrowstyle="->", lw=2.5, color="#475569")
ax.annotate("", xy=(3.7, 3.8), xytext=(2.8, 3.8), arrowprops=arrowprops)
ax.annotate("", xy=(7.1, 3.8), xytext=(6.3, 3.8), arrowprops=arrowprops)
ax.annotate("", xy=(5.0, 2.1), xytext=(5.0, 3.1), arrowprops=dict(arrowstyle="<->", lw=2.5, color="#1E3A8A", ls="--"))
ax.text(5.1, 2.6, "Detección y Alerta Temprana", ha='left', va='center', fontsize=8.5, fontweight='bold', color="#1E3A8A")

plt.title("Figura 1-1: Flujo de ataque de phishing frente a la intervención defensiva de PhishShield", fontsize=11, fontweight='bold', pad=12, color="#1E3A8A")
save_fig(fig, "figura_1_1.png")

# 2. Figura 2-1: Diagrama de Casos de Uso
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

# Actors
ax.text(1.0, 4.5, "[Actor]\nColaborador\n(Usuario PYME)", ha='center', va='center', fontsize=9.5, fontweight='bold', color="#1E3A8A",
        bbox=dict(boxstyle="round,pad=0.5", facecolor="#DBEAFE", edgecolor="#1E3A8A", lw=2))
ax.text(1.0, 1.5, "[Actor]\nAdministrador\n(Analista SOC)", ha='center', va='center', fontsize=9.5, fontweight='bold', color="#065F46",
        bbox=dict(boxstyle="round,pad=0.5", facecolor="#D1FAE5", edgecolor="#065F46", lw=2))

# Use cases
use_cases_user = [
    (4.5, 5.0, "CU-01: Analizar URL Sospechosa"),
    (4.5, 4.0, "CU-02: Responder Micro-Quiz IA"),
    (4.5, 3.0, "CU-03: Visualizar Sandbox DOM"),
    (4.5, 2.0, "CU-04: Reportar Phishing Comunitario")
]
use_cases_admin = [
    (8.0, 2.5, "CU-05: Iniciar Sesión SOC"),
    (8.0, 1.5, "CU-06: Exportar Forense (CSV/JSON)"),
    (8.0, 0.5, "CU-07: Purgar Falsos Positivos")
]

for x, y, text in use_cases_user:
    ellipse = patches.FancyBboxPatch((x-1.8, y-0.35), 3.6, 0.7, boxstyle="round,pad=0.2", facecolor="#F8FAFC", edgecolor="#3B82F6", lw=1.5)
    ax.add_patch(ellipse)
    ax.text(x, y, text, ha='center', va='center', fontsize=8.5, fontweight='bold', color="#1E293B")
    ax.plot([1.9, x-1.8], [4.5, y], color="#94A3B8", lw=1.5)

for x, y, text in use_cases_admin:
    ellipse = patches.FancyBboxPatch((x-1.8, y-0.35), 3.6, 0.7, boxstyle="round,pad=0.2", facecolor="#F0FDF4", edgecolor="#10B981", lw=1.5)
    ax.add_patch(ellipse)
    ax.text(x, y, text, ha='center', va='center', fontsize=8.5, fontweight='bold', color="#1E293B")
    ax.plot([1.9, x-1.8], [1.5, y], color="#94A3B8", lw=1.5)

plt.title("Figura 2-1: Diagrama General de Casos de Uso del Sistema PhishShield", fontsize=11, fontweight='bold', pad=12, color="#1E3A8A")
save_fig(fig, "figura_2_1.png")

# 3. Figura 3-1: Modelo Lógico de Persistencia JSON
fig, ax = plt.subplots(figsize=(10, 4.8), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 5)
ax.axis('off')

entities = [
    (0.5, 2.6, 2.5, 1.8, "history.json (Análisis)\n• url (String, PK)\n• riesgo (Enum)\n• puntuacion (0-10)\n• probabilidad_ml (Float)\n• timestamp (ISO 8601)", "#EFF6FF", "#1E3A8A"),
    (3.8, 2.6, 2.6, 1.8, "Metadatos Técnicos\n• inspeccion_ssl (Object)\n• inspeccion_dom (Object)\n• asistente_ia (Object)\n• indicadores (Array)", "#F1F5F9", "#475569"),
    (7.2, 2.6, 2.3, 1.8, "reports.json (Comunidad)\n• dominio (String, PK)\n• fecha_reporte (ISO)\n• motivo (String)", "#FEF2F2", "#DC2626"),
    (3.8, 0.4, 2.6, 1.6, "cache.json (En Memoria)\n• hash_url (Key)\n• resultado_analisis (Obj)\n• expiracion_ttl (24h)", "#F0FDF4", "#059669")
]

for x, y, w, h, text, fc, ec in entities:
    r = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15", facecolor=fc, edgecolor=ec, lw=2)
    ax.add_patch(r)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=8, color="#1E293B", family='monospace')

ax.annotate("", xy=(3.7, 3.5), xytext=(3.1, 3.5), arrowprops=dict(arrowstyle="<->", lw=2, color="#1E3A8A"))
ax.annotate("", xy=(7.1, 3.5), xytext=(6.5, 3.5), arrowprops=dict(arrowstyle="<-", lw=2, color="#DC2626"))
ax.annotate("", xy=(5.1, 2.5), xytext=(5.1, 2.1), arrowprops=dict(arrowstyle="<->", lw=2, color="#059669"))

plt.title("Figura 3-1: Modelo Lógico de Persistencia Documental y Estructuras JSON", fontsize=11, fontweight='bold', pad=12, color="#1E3A8A")
save_fig(fig, "figura_3_1.png")

# 4. Figura 3-2: Diagrama de Clases UML
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

classes = [
    (3.6, 3.8, 2.8, 1.8, "«Server»\nPhishShieldServer\n- app: Express\n- port: int\n- activeTokens: Set\n+ analyzeUrl(req, res)\n+ reportUrl(req, res)", "#1E3A8A", "#FFFFFF"),
    (0.3, 3.8, 2.6, 1.6, "«Analyzer»\nUrlAnalyzer\n+ analyze(url): Obj\n- extraerSLD(): Str", "#F8FAFC", "#1E293B"),
    (0.3, 1.6, 2.6, 1.8, "«Analyzer»\nTyposquattingDetector\n+ marcas: Array\n+ detectar(dom): Obj\n- getLevenshtein(): int", "#F8FAFC", "#1E293B"),
    (3.6, 1.4, 2.8, 1.8, "«Calculator»\nRiskCalculator\n+ calcular(ind, ml, dom): Obj\n+ determinarRiesgo(): Str", "#F8FAFC", "#1E293B"),
    (7.1, 3.8, 2.6, 1.8, "«Service»\nDomInspector (Puppeteer)\n+ marcasConocidas: Array\n+ inspeccionar(): Promise", "#F8FAFC", "#1E293B"),
    (7.1, 1.4, 2.6, 1.8, "«Service»\nMlService (FastAPI)\n- serviceUrl: Str\n+ predecirRiesgo(): Promise", "#F8FAFC", "#1E293B"),
]

for x, y, w, h, text, fc, tc in classes:
    r = patches.FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0.1", facecolor=fc, edgecolor="#0F172A", lw=1.5)
    ax.add_patch(r)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=7.5, color=tc, family='monospace')

# Connections to Server
ax.plot([3.0, 3.6], [4.6, 4.6], color="#0F172A", lw=1.5)
ax.plot([3.0, 3.6], [2.5, 4.2], color="#0F172A", lw=1.5)
ax.plot([5.0, 5.0], [3.8, 3.3], color="#0F172A", lw=1.5)
ax.plot([6.5, 7.1], [4.6, 4.6], color="#0F172A", lw=1.5)
ax.plot([6.5, 7.1], [4.2, 2.3], color="#0F172A", lw=1.5)

plt.title("Figura 3-2: Diagrama de Clases UML de Analizadores y Servicios en Backend", fontsize=11, fontweight='bold', pad=12, color="#1E3A8A")
save_fig(fig, "figura_3_2.png")

# 5. Figura 3-3: Diagrama de Secuencia
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

cols = [(1.2, "Cliente (UI)"), (3.5, "Node.js (:3001)"), (6.0, "FastAPI ML (:8000)"), (8.5, "Puppeteer / TLS")]
for cx, cname in cols:
    ax.text(cx, 5.5, cname, ha='center', va='center', fontsize=9, fontweight='bold', color="#1E3A8A",
            bbox=dict(boxstyle="round,pad=0.3", facecolor="#E2E8F0", edgecolor="#64748B"))
    ax.plot([cx, cx], [0.8, 5.2], color="#94A3B8", lw=1.5, ls="--")

seq_steps = [
    (1.2, 3.5, 4.8, "1. POST /analizar { url }", "#1E3A8A", True),
    (3.5, 6.0, 4.2, "2. POST /predict (Timeout 2s)", "#2563EB", True),
    (6.0, 3.5, 3.6, "3. { probability, features }", "#2563EB", False),
    (3.5, 8.5, 3.0, "4. Inspección DOM & SSL (Socket/Sandbox)", "#D97706", True),
    (8.5, 3.5, 2.4, "5. { domForms, sslChain, certAge }", "#D97706", False),
    (3.5, 3.5, 1.8, "6. RiskCalculator & IA Quiz Generator", "#059669", True),
    (3.5, 1.2, 1.2, "7. 200 OK { riesgo, score, ia, preview }", "#1E3A8A", False)
]

for x1, x2, y, label, col, is_fwd in seq_steps:
    if x1 != x2:
        ax.annotate("", xy=(x2, y), xytext=(x1, y), arrowprops=dict(arrowstyle="->" if is_fwd else "<-", lw=1.8, color=col))
        ax.text((x1+x2)/2, y+0.15, label, ha='center', va='bottom', fontsize=8, color=col, fontweight='bold')
    else:
        rect = patches.Rectangle((x1-0.2, y-0.2), 0.4, 0.4, facecolor="#D1FAE5", edgecolor="#059669")
        ax.add_patch(rect)
        ax.text(x1+0.4, y, label, ha='left', va='center', fontsize=8, color=col, fontweight='bold')

plt.title("Figura 3-3: Diagrama de Secuencia del Análisis Concurrente Multicapa de URLs", fontsize=11, fontweight='bold', pad=12, color="#1E3A8A")
save_fig(fig, "figura_3_3.png")

# 6. Figura 3-4: Diagrama de Componentes y Despliegue
fig, ax = plt.subplots(figsize=(10, 5.0), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 5)
ax.axis('off')

comp_boxes = [
    (0.5, 2.5, 2.6, 2.0, "«Frontend Web»\n• uiManager.js\n• adminManager.js (SOC)\n• tipsEngine.js\n(HTML5 / CSS3 / Vanilla JS)", "#EFF6FF", "#1D4ED8"),
    (3.7, 2.5, 2.8, 2.0, "«Core Backend :3001»\n• Express.js REST API\n• urlAnalyzer & typosquatting\n• sslInspector & domInspector\n• RiskCalculator & Cache", "#F0FDF4", "#047857"),
    (7.1, 2.5, 2.5, 2.0, "«ML Service :8000»\n• FastAPI + Uvicorn\n• RandomForest (100 trees)\n• extractor.py (15 feat)\n• Shannon Entropy Calc", "#FEF3C7", "#B45309"),
    (3.7, 0.4, 2.8, 1.5, "«Persistencia Local»\n• history.json\n• reports.json\n• cache.json", "#F8FAFC", "#475569")
]

for x, y, w, h, text, fc, ec in comp_boxes:
    r = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15", facecolor=fc, edgecolor=ec, lw=2)
    ax.add_patch(r)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=8, color="#0F172A")

ax.annotate("", xy=(3.6, 3.5), xytext=(3.2, 3.5), arrowprops=dict(arrowstyle="<->", lw=2, color="#1D4ED8"))
ax.annotate("", xy=(7.0, 3.5), xytext=(6.6, 3.5), arrowprops=dict(arrowstyle="<->", lw=2, color="#B45309"))
ax.annotate("", xy=(5.1, 2.4), xytext=(5.1, 2.0), arrowprops=dict(arrowstyle="<->", lw=2, color="#047857"))

plt.title("Figura 3-4: Diagrama de Componentes y Arquitectura de Despliegue Físico", fontsize=11, fontweight='bold', pad=12, color="#1E3A8A")
save_fig(fig, "figura_3_4.png")

print("All diagrams generated successfully.")
