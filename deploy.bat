@echo off
setlocal enabledelayedexpansion

title AR FleetTrack - GitHub Fix & Push Helper
color 0b

echo ==============================================================================
echo               AR FLEETTRACK - GITHUB FIX & PUSH HELPER
echo ==============================================================================
echo.

:: 1. Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0c
    echo [ERROR] Git is not installed or not in your system PATH.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

:: 2. Ensure Git Identity is configured (fixes the silent 'Author identity unknown' failure)
git config user.name >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [Configuring Git Identity] Setting default Git author name & email...
    git config --global user.name "Atharsh"
    git config --global user.email "atharsh@users.noreply.github.com"
)

:: 3. Initialize if needed
if not exist ".git" (
    git init
    git branch -M main
)

:: 4. Stage all files
echo [1/3] Staging all files...
git add -A

:: 5. Create the Commit
echo [2/3] Creating commit...
git commit -m "Initial commit: AR FleetTrack with Vercel Webhook API"

:: 6. Check if remote origin is set
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo Setting remote origin to https://github.com/Atharsh00/ar-fleettrack ...
    git remote add origin https://github.com/Atharsh00/ar-fleettrack
) else (
    echo [Remote] Origin is set to:
    git remote get-url origin
)

:: Ensure on branch main
git branch -M main

echo.
echo [3/3] Pushing files to GitHub...
echo (If a GitHub sign-in window appears, click 'Sign in with your browser' to authorize)
echo.

git push -u origin main --force

if %ERRORLEVEL% equ 0 (
    color 0a
    echo.
    echo ==============================================================================
    echo [SUCCESS] ALL FILES ARE NOW SAFELY ON GITHUB!
    echo ==============================================================================
    echo You can verify your files here: https://github.com/Atharsh00/ar-fleettrack
    echo.
    echo Now, go back to your Vercel tab and click 'Deploy' again.
    echo Vercel will now find package.json, index.html, and all your files!
    echo ==============================================================================
) else (
    color 0c
    echo.
    echo ==============================================================================
    echo [ERROR] Git push did not complete.
    echo This usually happens if you are not yet authenticated to GitHub on your PC.
    echo.
    echo You can also run this command in your PowerShell:
    echo     git push -u origin main
    echo and follow the browser sign-in prompt.
    echo ==============================================================================
)

echo.
pause
