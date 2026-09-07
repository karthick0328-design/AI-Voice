@echo off
title AI Voice Agent Launcher
echo ===================================================
echo   Starting AI Voice OS (Ollama + Tunnel + Backend + Frontend)
echo ===================================================

echo [1/3] Starting Ollama service...
start /B ollama serve

echo [2/3] Starting Secure Tunnel for Vercel...
start /B npx lt --port 5001 --subdomain aivoice-os-engine

echo [3/3] Starting Backend & Frontend...
npm run dev
