# Build + package EU4Youth for Prodexo preprod (SFTP upload).
# Does NOT change your source files — only writes to dist/ and deploy/preprod/.

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host ">> Building preprod bundle (single index.html)..." -ForegroundColor Cyan
npm run build:preprod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$deployDir = Join-Path $root 'deploy\preprod'
$backupDir = Join-Path $root 'deploy\backups'
New-Item -ItemType Directory -Force -Path $deployDir, $backupDir | Out-Null

$stamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
Copy-Item (Join-Path $root 'dist\index.html') (Join-Path $deployDir 'index.html') -Force
Copy-Item (Join-Path $root 'dist\index.html') (Join-Path $deployDir "index-$stamp.html") -Force

$sizeMb = [math]::Round((Get-Item (Join-Path $deployDir 'index.html')).Length / 1MB, 1)
Write-Host ">> Upload file: deploy/preprod/index.html ($sizeMb MB)" -ForegroundColor Green
Write-Host ">> Timestamped copy: deploy/preprod/index-$stamp.html" -ForegroundColor Green

# Optional source snapshot (excludes node_modules + dist to keep zip small)
$zipPath = Join-Path $backupDir "source-$stamp.zip"
if (-not (Test-Path $zipPath)) {
  Write-Host ">> Creating source backup zip (no node_modules)..." -ForegroundColor Cyan
  $temp = Join-Path $env:TEMP "eu4youth-src-$stamp"
  if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
  New-Item -ItemType Directory -Path $temp | Out-Null
  robocopy $root $temp /E /XD node_modules dist deploy\backups .git /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
  Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $zipPath -Force
  Remove-Item $temp -Recurse -Force
  Write-Host ">> Source backup: deploy/backups/source-$stamp.zip" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next: SFTP upload deploy/preprod/index.html to the server folder for /eu4youth/" -ForegroundColor Yellow
