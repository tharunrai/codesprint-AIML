@echo off
echo ==========================================
echo Starting AI Agent Server Setup...
echo ==========================================

:: Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ and try again.
    pause
    exit /b
)

:: Create virtual environment if it doesn't exist
IF NOT EXIST "venv" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

:: Activate the virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

:: Install requirements
echo [INFO] Installing dependencies...
pip install -r requirements.txt

:: Check if .env exists, if not copy from .env.example
IF NOT EXIST ".env" (
    echo [INFO] .env file not found. Creating one from .env.example...
    copy .env.example .env
)

echo ==========================================
echo Setup Complete! Starting FastAPI Server...
echo ==========================================
echo The server will be available at http://127.0.0.1:8000
echo.

:: Run the server
uvicorn main:app --reload
