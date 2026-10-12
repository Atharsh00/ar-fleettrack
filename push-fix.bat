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

echo [2/3] Committing Option 1 1-Click Connect Gmail feature...
git commit -m "Feature: Implement Option 1 1-Click Connect Gmail in-app auto sync"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Feature: Implement Option 1 1-Click Connect Gmail in-app auto sync"
echo ==============================================================================
echo.
pause
