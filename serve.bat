@echo off
rem ---------------------------------------------------------------
rem  Herman CV — local dev server
rem  Serves the site over http so the WebGL brain, page wipes and
rem  sessionStorage all work (file:// blocks them).
rem ---------------------------------------------------------------
cd /d "%~dp0"
set PORT=8123

echo.
echo   Serving Herman CV at http://localhost:%PORT%/
echo   Press Ctrl+C to stop.
echo.

start "" "http://localhost:%PORT%/index.html"

where python >nul 2>nul
if %errorlevel%==0 (
    python -m http.server %PORT%
    goto :eof
)
where py >nul 2>nul
if %errorlevel%==0 (
    py -m http.server %PORT%
    goto :eof
)
echo Python not found. Install Python or serve this folder with any static server.
pause
