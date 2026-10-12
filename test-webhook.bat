@echo off
setlocal enabledelayedexpansion

title Test Live Vercel Email Webhook
color 0b

echo ==============================================================================
echo             TEST YOUR LIVE VERCEL INBOUND EMAIL WEBHOOK
echo ==============================================================================
echo.

set /p APP_DOMAIN="Enter your Vercel URL (e.g. https://ar-fleettrack.vercel.app or ar-fleettrack.vercel.app): "

:: Clean URL
if "%APP_DOMAIN:~0,4%" neq "http" (
    set "APP_URL=https://%APP_DOMAIN%"
) else (
    set "APP_URL=%APP_DOMAIN%"
)

:: Remove trailing slash if present
if "%APP_URL:~-1%"=="/" set "APP_URL=%APP_URL:~0,-1%"

set "WEBHOOK_URL=%APP_URL%/api/webhooks/email?token=sk_live_fleettrack_secret_9921"

echo.
echo Target Webhook Endpoint:
echo %WEBHOOK_URL%
echo.

echo ==============================================================================
echo [1/2] Sending Test 1: FASTag Toll Debit Alert (₹650 for vehicle MH-12-RN-4825)
echo ==============================================================================
echo.

curl -s -X POST "%WEBHOOK_URL%" ^
  -H "Content-Type: application/json" ^
  -d "{\"From\": \"fastag-alerts@icicibank.com\", \"To\": \"fleet@inbound.fleettrack.com\", \"Subject\": \"FASTag Toll Debit Alert\", \"Date\": \"2026-10-12T08:00:00Z\", \"TextBody\": \"Dear Customer, your FASTag account has been debited by INR 650.00 at Khed-Shivapur Toll Plaza on 12-10-2026 for Vehicle MH-12-RN-4825. Remaining balance: INR 4,200.00.\"}"

echo.
echo.
echo ==============================================================================
echo [2/2] Sending Test 2: Diesel Fuel Purchase Alert (₹18,200 for vehicle MH-14-GH-3518)
echo ==============================================================================
echo.

curl -s -X POST "%WEBHOOK_URL%" ^
  -H "Content-Type: application/json" ^
  -d "{\"from\": \"fleetcard@iocl.co.in\", \"to\": \"fleet@inbound.fleettrack.com\", \"subject\": \"Fuel Transaction Alert\", \"date\": \"2026-10-12T08:15:00Z\", \"text\": \"Transaction Successful. Fuel Purchase of Rs 18,200.00 recorded on Card 4402 for Vehicle MH-14-GH-3518 at IOCL Highway Pump on 12-10-2026. Volume: 198.5 Ltrs.\"}"

echo.
echo.
echo ==============================================================================
echo If you see '\"success\": true' above, your live Vercel Webhook is working 100%%!
echo You can now check your live web app to see the newly logged expenses.
echo ==============================================================================
echo.
pause
