# Prodexo serves /eu4youth/<file> at dist root, but not /eu4youth/assets/*.
param(
  [string]$Dist = (Join-Path (Split-Path $PSScriptRoot -Parent) "dist")
)

$ErrorActionPreference = 'Stop'
$index = Join-Path $Dist 'index.html'
$assets = Join-Path $Dist 'assets'

if (-not (Test-Path $index)) { throw "Missing index.html. Run npm run build first." }

$html = Get-Content $index -Raw
$js = Get-ChildItem $assets -Filter 'index-*.js' | Select-Object -First 1
$css = Get-ChildItem $assets -Filter 'index-*.css' | Select-Object -First 1
if (-not $js -or -not $css) { throw "Missing index bundles in assets folder." }

Copy-Item $js.FullName (Join-Path $Dist $js.Name) -Force
Copy-Item $css.FullName (Join-Path $Dist $css.Name) -Force

$base = '/eu4youth/'
$html = $html -replace '/eu4youth/assets/index-[^"]+\.js', "$base$($js.Name)"
$html = $html -replace '/eu4youth/assets/index-[^"]+\.css', "$base$($css.Name)"
Set-Content -Path $index -Value $html -NoNewline

Write-Host "Patched dist for Prodexo: $($js.Name) + $($css.Name) at dist root" -ForegroundColor Green
