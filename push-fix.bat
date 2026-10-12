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

echo [2/3] Committing auto-sync and resilient email query fixes...
git commit -m "Fix: Add real-time auto-sync background timer and flexible Gmail subject/amount parsing"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Fix: Add real-time auto-sync background timer and flexible Gmail subject/amount parsing"
echo ==============================================================================
echo.
pause
