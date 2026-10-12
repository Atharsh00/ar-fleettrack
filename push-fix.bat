@echo off
title Push Latest Fix to GitHub
color 0a

echo ==============================================================================
echo           PUSHING LATEST FIX TO GITHUB (Atharsh00/ar-fleettrack)
echo ==============================================================================
echo.

cd /d "C:\Users\athar\.gemini\antigravity\scratch\fleet-management"

echo [1/3] Adding all files...
git add -A

echo [2/3] Committing email parser and re-scan cache fixes...
git commit -m "Fix: Robust email amount parsing and add Re-Scan All button"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Fix: Robust email amount parsing and add Re-Scan All button"
echo ==============================================================================
echo.
pause
