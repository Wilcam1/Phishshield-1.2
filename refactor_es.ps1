# Refactor to Spanish – PowerShell script
# This script performs the full refactor described in the plan.
# It is intended to be run from the repository root.

Set-StrictMode -Version Latest

function Commit-Step([string]$message) {
    git add -A
    git commit -m $message
    if ($LASTEXITCODE -ne 0) { Write-Error "Commit failed: $message"; exit 1 }
}

# 1. Add .gitignore (already added) – just commit it
Commit-Step "refactor: agregar .gitignore"

# 2. Rename top‑level directories
$renames = @(
    @{ from="client";   to="cliente" },
    @{ from="server";   to="servidor" },
    @{ from="scripts";  to="utilidades" }
)
foreach ($r in $renames) {
    if (Test-Path $r.from) {
        git mv $r.from $r.to
    }
}
Commit-Step "refactor: renombrar carpetas principales a español"

# 3. Rename internal sub‑folders
# cliente subfolders
if (Test-Path "cliente\src\components") { git mv "cliente\src\components" "cliente\src\componentes" }
if (Test-Path "cliente\src\utils") { git mv "cliente\src\utils" "cliente\src\utiles" }
# servidor subfolders
if (Test-Path "servidor\analyzers") { git mv "servidor\analyzers" "servidor\analizadores" }
if (Test-Path "servidor\repositories") { git mv "servidor\repositories" "servidor\repositorios" }
if (Test-Path "servidor\services") { git mv "servidor\services" "servidor\servicios" }
Commit-Step "refactor: renombrar carpetas internas a español"

# 4. Rename script files (Python / batch)
$scriptMap = @(
    @{ from="utilidades\analyze_plantilla.py";   to="utilidades\analizar_plantilla.py" },
    @{ from="utilidades\audit_plantilla12.py";   to="utilidades\auditar_plantilla12.py" },
    @{ from="utilidades\build_full_comprehensive_word_doc.py"; to="utilidades\construir_doc_completo.py" },
    @{ from="utilidades\build_thesis_word_doc.py"; to="utilidades\construir_tesis.py" },
    @{ from="utilidades\compare_docs.py";          to="utilidades\comparar_docs.py" },
    @{ from="utilidades\dump_docs.py";             to="utilidades\volcar_docs.py" },
    @{ from="utilidades\dump_plantilla_12.txt";    to="utilidades\volcar_plantilla_12.txt" },
    @{ from="utilidades\dump_proyecto_draft.txt"; to="utilidades\volcar_proyecto_borrador.txt" },
    @{ from="utilidades\dump_tables_info.py";     to="utilidades\volcar_tablas_info.py" },
    @{ from="utilidades\execute_v2_transformation.py"; to="utilidades\ejecutar_transformacion_v2.py" },
    @{ from="utilidades\find_section_breaks.py";   to="utilidades\encontrar_quiebres_seccion.py" },
    @{ from="utilidades\generate_figures.py";       to="utilidades\generar_figuras.py" },
    @{ from="utilidades\generate_ui_figures.py";   to="utilidades\generar_figuras_ui.py" },
    @{ from="utilidades\iniciar.bat";              to="utilidades\iniciar.bat" },
    @{ from="utilidades\detener.bat";              to="utilidades\detener.bat" },
    @{ from="utilidades\detener_servicios.bat";   to="utilidades\detener_servicios.bat" },
    @{ from="utilidades\iniciar_servicios.bat";   to="utilidades\iniciar_servicios.bat" }
)
foreach ($m in $scriptMap) {
    if (Test-Path $m.from) { git mv $m.from $m.to }
}
Commit-Step "refactor: renombrar archivos de scripts a español"

# 5. Rename documentation files
if (Test-Path "README.md") { git mv "README.md" "README.es.md" }
if (Test-Path "CHANGELOG.md") { git mv "CHANGELOG.md" "CHANGELOG.es.md" }
Commit-Step "refactor: traducir nombres de documentos a español"

# 6. Remove unwanted directories
if (Test-Path "__MACOSX") { git rm -r --cached __MACOSX }
if (Test-Path "generated_figures") { git rm -r --cached generated_figures }
Commit-Step "refactor: eliminar carpetas __MACOSX y generated_figures"

# 7. Replace class and function names in source files (JS and Python)
$replacements = @(
    # JavaScript / Node
    @{ pattern="UrlAnalyzer"; replacement="AnalizadorUrl" },
    @{ pattern="RiskCalculator"; replacement="CalculadorRiesgo" },
    @{ pattern="PhishTankService"; replacement="ServicioPhishTank" },
    @{ pattern="SafeBrowsingService"; replacement="ServicioSafeBrowsing" },
    @{ pattern="client/"; replacement="cliente/" },
    @{ pattern="server/"; replacement="servidor/" },
    @{ pattern="utils/"; replacement="utiles/" },
    # Python
    @{ pattern="def analyze_plantilla"; replacement="def analizar_plantilla" },
    @{ pattern="def audit_plantilla12"; replacement="def auditar_plantilla12" },
    @{ pattern="def build_full_comprehensive_word_doc"; replacement="def construir_doc_completo" },
    @{ pattern="def build_thesis_word_doc"; replacement="def construir_tesis" }
)
# Process JS files
Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts -File | ForEach-Object {
    $content = Get-Content $_ -Raw
    $changed = $false
    foreach ($r in $replacements) {
        if ($content -match $r.pattern) {
            $content = $content -replace $r.pattern, $r.replacement
            $changed = $true
        }
    }
    if ($changed) { Set-Content -Path $_ -Value $content }
}
# Process Python files
Get-ChildItem -Recurse -Include *.py -File | ForEach-Object {
    $content = Get-Content $_ -Raw
    $changed = $false
    foreach ($r in $replacements) {
        if ($content -match $r.pattern) {
            $content = $content -replace $r.pattern, $r.replacement
            $changed = $true
        }
    }
    if ($changed) { Set-Content -Path $_ -Value $content }
}
Commit-Step "refactor: traducir nombres de clases, funciones e imports a español"

# 8. Consolidate analyzers (optional – not fully automated, left as manual step)
Write-Host "⚠️  Consolidación de analizadores debe revisarse manualmente."

# 9. Final validation – run npm install/build if package.json exists
if (Test-Path "cliente/package.json") {
    Push-Location cliente
    npm install
    npm run build
    Pop-Location
}
if (Test-Path "servidor/package.json") {
    Push-Location servidor
    npm install
    Pop-Location
}
Write-Host "✅ Refactor completo (excepto consolidación manual)"
