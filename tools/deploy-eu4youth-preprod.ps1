# EU4Youth ONLY - deploy to /eu4youth/ on Prodexo preprod
# Does NOT touch FI2T (/fi2t/).
#
# Usage:
#   .\tools\deploy-eu4youth-preprod.ps1           # fast multi-file (~1 MB)
#   .\tools\deploy-eu4youth-preprod.ps1 -Full     # single inlined HTML (~50 MB) - avoid unless needed

param([switch]$Full)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$remote = 'youssef@137.74.88.16'
$remoteDist = 'eu4youth/website/dist'

Write-Host "=== EU4Youth preprod (/eu4youth/) ===" -ForegroundColor Cyan

if ($Full) {
  Write-Host "Full build (~50 MB, all images inlined)..." -ForegroundColor Yellow
  npm run build:preprod
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  $sizeMb = [math]::Round((Get-Item "dist\index.html").Length / 1MB, 1)
  Write-Host "Built index.html ($sizeMb MB)" -ForegroundColor Green
  Write-Host "Uploading index.html only..." -ForegroundColor Yellow
  scp -P 22 -o BatchMode=yes "dist\index.html" "${remote}:${remoteDist}/index.html"
} else {
  Write-Host "Fast build (~1 MB, like FI2T)..." -ForegroundColor Yellow
  npm run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & (Join-Path $root "tools\patch-dist-for-prodexo.ps1")
  Write-Host "Uploading dist/* ..." -ForegroundColor Yellow
  scp -P 22 -o BatchMode=yes -r "dist\*" "${remote}:${remoteDist}/"
}

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# SFTP uploads often land as 600/700; nginx then returns 403 on /img and /assets.
Write-Host "Fixing remote permissions (644 files / 755 dirs)..." -ForegroundColor Yellow
$chmodCmds = @(
  "chmod 755 $remoteDist",
  "chmod 755 $remoteDist/img",
  "chmod 755 $remoteDist/assets",
  "chmod 755 $remoteDist/docs",
  "chmod 644 $remoteDist/index.html"
)
Get-ChildItem -Recurse dist\img, dist\assets, dist\docs -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $rel = $_.FullName.Substring((Resolve-Path dist).Path.Length + 1).Replace('\', '/')
  $chmodCmds += "chmod 755 $remoteDist/$rel"
}
Get-ChildItem -Recurse dist -File -ErrorAction SilentlyContinue | ForEach-Object {
  $rel = $_.FullName.Substring((Resolve-Path dist).Path.Length + 1).Replace('\', '/')
  $chmodCmds += "chmod 644 $remoteDist/$rel"
}
$batch = Join-Path $env:TEMP "eu4youth-sftp-chmod.txt"
$chmodCmds | Set-Content -Path $batch -Encoding ascii
sftp -P 22 -o BatchMode=yes -b $batch $remote | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Warning: chmod batch failed - images may 403 until permissions are fixed." -ForegroundColor DarkYellow
}

Copy-Item "dist\index.html" "deploy\preprod\index.html" -Force
Write-Host ""
Write-Host "Done: https://preprod2026.prodexo.agency/eu4youth/" -ForegroundColor Green
Write-Host "Hard refresh: Ctrl+Shift+R" -ForegroundColor Yellow
