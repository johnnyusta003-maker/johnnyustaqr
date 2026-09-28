# Generates internal Torrente menu PDF (not for the website).
# Usage: powershell -ExecutionPolicy Bypass -File internal/export-torrente-pdf.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outPdf = Join-Path $root "internal\menu-torrente.pdf"
$htmlPath = Join-Path $root "index.html"
$htmlUri = "file:///" + ($htmlPath -replace '\\', '/') -replace ' ', '%20'

$browsers = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
)

$browser = $browsers | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) {
  Write-Error "Edge or Chrome not found. Open index.html and use Print > Save as PDF."
}

New-Item -ItemType Directory -Force -Path (Split-Path $outPdf) | Out-Null
if (Test-Path $outPdf) { Remove-Item $outPdf -Force }

& $browser `
  --headless=new `
  --disable-gpu `
  --no-pdf-header-footer `
  --print-to-pdf="$outPdf" `
  $htmlUri

$deadline = (Get-Date).AddSeconds(20)
while (-not (Test-Path $outPdf) -and (Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 300
}

if (-not (Test-Path $outPdf)) {
  Write-Error "PDF was not created."
}

Write-Host "Saved: $outPdf"
