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

echo [2/3] Committing updates: Fix payments received line items in Deep Dive & add receipt date input...
git commit -m "Fix: Populate itemized payments received in Company Deep Dive table and add custom receipt date picker"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Feat: Nav above summary cards, trip payment received deduction, correct trip expense calc, and per-column filtering across all tables"
echo ==============================================================================
echo.
pause
