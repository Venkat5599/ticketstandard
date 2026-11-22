$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$ai = Join-Path $root "local_ai"
$venv = Join-Path $ai ".venv"
$weights = Join-Path $ai "models\NAFNet-GoPro-width64.pth"

if (-not (Get-Command py -ErrorAction SilentlyContinue)) { throw "Install Python 3.11 first, then run npm run ai:setup again." }
if (-not (Test-Path (Join-Path $venv "Scripts\python.exe"))) { py -3.11 -m venv $venv }
$python = Join-Path $venv "Scripts\python.exe"
& $python -m pip install --upgrade pip
& $python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
& $python -m pip install -r (Join-Path $ai "requirements.txt")
if (-not (Test-Path $weights)) {
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $weights) | Out-Null
  & $python -m pip install gdown
  & $python -m gdown "https://drive.google.com/uc?id=1S0PVRbyTakYY9a82kujgZLbMihfNBLfC" -O $weights
}
Write-Host "Local NAFNet setup is ready. Run npm run dev to use it."
