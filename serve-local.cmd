@echo off
title Vigency Local Preview
cd /d C:\Users\user\Downloads\Vigency
echo.
echo ========================================
echo   Starting Vigency at localhost:3000
echo ========================================
echo.

if not exist "node_modules\next\dist\bin\next" (
  echo Installing required packages...
  call npm.cmd install
  if errorlevel 1 goto failed
)

start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"
call npm.cmd run dev

:failed
echo.
echo The Vigency server could not start.
echo Please copy the error shown above and send it to Codex.
echo.
pause
