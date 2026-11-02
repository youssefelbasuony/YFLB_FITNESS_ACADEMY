@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install Node.js 24 or newer, then run this file again.
  pause
  exit /b 1
)

node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 24 ? 0 : 1)"
if errorlevel 1 (
  echo This app needs Node.js 24 or newer. Install a supported Node.js version and run this file again.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm was not found. Repair your Node.js installation and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\next\package.json" (
  echo Installing YFLB Fitness Academy packages. This may take a few minutes the first time.
  call npm install
  if errorlevel 1 (
    echo Package installation failed. Check the npm output above.
    pause
    exit /b 1
  )
)

echo Starting YFLB Fitness Academy. Open http://127.0.0.1:3000 in your browser.
call npm run dev
