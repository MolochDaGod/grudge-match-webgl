@echo off
echo ================================
echo  GRUDGE MATCH WebGL Deployment
echo ================================
echo.

REM Check if we're in the right directory
if not exist "index.html" (
    echo ERROR: index.html not found. Make sure you're in the WebGL build directory.
    pause
    exit /b 1
)

echo [1/4] Checking build files...
if not exist "Build" (
    echo ERROR: Build folder not found. Please build your Unity project first.
    pause
    exit /b 1
)

echo [2/4] Initializing Git repository (if needed)...
if not exist ".git" (
    git init
    echo Git repository initialized.
) else (
    echo Git repository already exists.
)

echo [3/4] Adding files to Git...
git add .
git status

echo.
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Update WebGL build v1.7.3

git commit -m "%commit_message%"

echo [4/4] Deployment options:
echo 1. Push to GitHub (manual setup required)
echo 2. Test locally
echo 3. Exit
echo.
set /p choice="Choose option (1-3): "

if "%choice%"=="1" (
    echo.
    echo To complete GitHub deployment:
    echo 1. Create repository at: https://github.com/new
    echo 2. Name it: grudge-match-webgl
    echo 3. Copy and paste these commands:
    echo.
    echo git remote add origin https://github.com/YourUsername/grudge-match-webgl.git
    echo git branch -M main
    echo git push -u origin main
    echo.
    echo 4. Go to Settings ^> Pages and select "GitHub Actions" as source
    echo.
    pause
) else if "%choice%"=="2" (
    echo.
    echo Starting local server...
    echo Game will be available at: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo Goodbye!
)

pause