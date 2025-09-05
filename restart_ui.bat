@echo off
echo Restarting Mobile UI with fresh proxy configuration...

REM Kill any existing Vite process on port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing PID %%a on port 3001
    taskkill /PID %%a /F 2>nul
)

REM Clear Vite cache
echo Clearing Vite cache...
rmdir /s /q node_modules\.vite 2>nul
rmdir /s /q .vite 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start fresh
echo Starting Mobile UI...
npm run dev