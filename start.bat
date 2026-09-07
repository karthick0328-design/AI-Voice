@echo off
title AI Voice Agent Launcher
echo ===================================================
echo   Starting AI Voice OS (Ollama + Tunnel + Backend + Frontend)
echo ===================================================

echo [1/3] Starting Ollama service...
start /B ollama serve

echo [2/3] Starting Secure Tunnel for Vercel...
start /B ssh -o StrictHostKeyChecking=no -R 80:127.0.0.1:5001 nokey@localhost.run

echo [3/3] Starting Backend & Frontend...
npm run dev
