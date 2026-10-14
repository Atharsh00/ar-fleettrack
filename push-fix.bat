@echo off
title Push Latest Update to GitHub
color 0a

echo ==============================================================================
echo           PUSHING LATEST UPDATE TO GITHUB (Atharsh00/ar-fleettrack)
echo ==============================================================================
echo.

cd /d "C:\Users\athar\.gemini\antigravity\scratch\fleet-management"

echo [1/3] Adding all files...
git add -A

echo [2/3] Committing updates: Fix Company Receivables tab and add Trip Link column to Truck Performance...
git commit -m "Fix: Company Receivables tab crash by adding missing dependencies; add Trip Link / Scope column to Truck Performance expenses table"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Fix: Company Receivables tab crash by adding missing dependencies; add Trip Link / Scope column to Truck Performance expenses table"
echo ==============================================================================
echo.
pause
