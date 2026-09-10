@echo off
title Preparation Map
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js was not found on this machine.
  echo   The app needs it to serve files - browsers refuse to load
  echo   JavaScript modules directly from a file:// path.
  echo.
  echo   Install Node from https://nodejs.org and run this file again.
  echo.
  pause
  exit /b 1
)

echo.
echo   Preparation Map
echo   ---------------
echo   Serving on http://localhost:4173
echo.
echo   Keep this window open while you use the app.
echo   Close it (or press Ctrl+C) to stop the server.
echo.

REM Open the browser a moment AFTER the server is listening, so a cold
REM start does not land on a connection error.
start "" /min cmd /c "timeout /t 2 /nobreak >nul & start """" http://localhost:4173"

node serve.js 4173

REM serve.js exits 1 when the port is taken, which almost always means the
REM app is ALREADY running in another window. Say so, rather than the
REM misleading "server stopped".
if errorlevel 1 (
  echo.
  echo   It looks like the app is already running in another window.
  echo   Your browser should have opened it. If not, go to:
  echo     http://localhost:4173
  echo.
  echo   You can close this window.
  echo.
  pause
  exit /b 0
)

echo.
echo   Server stopped. The app will not load until you run this file again.
echo.
pause
