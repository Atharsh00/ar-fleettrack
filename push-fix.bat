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

echo [2/3] Committing updates: Remove Received/Pending columns, DD-MM-YYYY date formatting, and Privacy Data Erasure with safety confirmation...
git commit -m "Feat: Remove Received and Pending from vehicle trips table, format dates to DD-MM-YYYY, and add Privacy Data Erasure with Are-You-Sure confirmation dialog"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Feat: Remove Received and Pending from vehicle trips table, format dates to DD-MM-YYYY, and add Privacy Data Erasure with Are-You-Sure confirmation dialog"
echo ==============================================================================
echo.
pause
