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

echo [2/3] Committing updates: Incorporate Driver Expense Claims into Truck & Trip Operating Costs...
git commit -m "Feat: Link driver expense claims to Truck and Trip in Data Entry, Driver Ledger, and Edit modals; include in vehicle & trip operating costs"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Feat: Link driver expense claims to Truck and Trip in Data Entry, Driver Ledger, and Edit modals; include in vehicle & trip operating costs"
echo ==============================================================================
echo.
pause
