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

echo [2/3] Committing updates: Driver claims reimbursable option, clean Remaining Due, same-date timeline ordering, and trip entry simplification...
git commit -m "Feat: Driver claims reimbursable option, clean Remaining Due, same-date timeline ordering, and trip entry simplification"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Feat: Driver claims reimbursable option, clean Remaining Due, same-date timeline ordering, and trip entry simplification"
echo ==============================================================================
echo.
pause
