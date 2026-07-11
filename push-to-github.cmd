@echo off
title Push Vigency to GitHub
cd /d C:\Users\user\Downloads\Vigency

set "GIT_DIR=C:\Users\user\Downloads\Vigency\.repo-git"
set "GIT_WORK_TREE=C:\Users\user\Downloads\Vigency"

echo.
echo Pushing Vigency to github.com/vicethetechguy/vigency...
echo.

git -c http.sslBackend=openssl push -u origin main

if errorlevel 1 (
  echo.
  echo Push failed. Keep this window open and send the error to Codex.
  pause
  exit /b 1
)

echo.
echo Push completed successfully.
pause
