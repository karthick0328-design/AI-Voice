@echo off
title AI Voice Agent Launcher
echo ===================================================
echo   Starting AI Voice OS (Ollama + Cloudflare Tunnel + Backend + Frontend)
echo ===================================================

echo [1/3] Starting Ollama service...
start /B ollama serve

echo [2/3] Starting Cloudflare Tunnel for Vercel...
start /B .\cloudflared.exe tunnel --url http://localhost:5001

echo [3/3] Starting Backend & Frontend...
npm run dev
