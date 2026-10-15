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

echo [2/3] Committing updates: Link Supabase Cloud Database with Offline/Demo Sandbox toggle and simulation data manager...
git commit -m "Feat: Link Supabase Cloud Database with Offline/Demo Sandbox toggle and simulation data manager"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Feat: Link Supabase Cloud Database with Offline/Demo Sandbox toggle and simulation data manager"
echo ==============================================================================
echo.
pause
