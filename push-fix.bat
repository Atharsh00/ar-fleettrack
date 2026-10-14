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

echo [2/3] Committing updates: Unify Truck Performance P&L, Home Fleet Profit, and Client Reimbursables...
git commit -m "Fix: Align Truck Performance P&L with comprehensive costs, update Home Fleet Net Profit, exclude reimbursables from trip costs, and track client reimbursables in Deep Dive"

echo [3/3] Pushing to GitHub main branch...
git push -u origin main

echo.
echo ==============================================================================
echo Done! Please check https://github.com/Atharsh00/ar-fleettrack
echo The latest commit will show: "Feat: Nav above summary cards, trip payment received deduction, correct trip expense calc, and per-column filtering across all tables"
echo ==============================================================================
echo.
pause
