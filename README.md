# AETHER — Advanced Local Personal AI Operating System (AI OS)

A production-quality, local-first **Personal AI Assistant / AI Agent** built with React, Three.js, Node.js, Express, MongoDB, and local Ollama (`llama3.1:8b`).

![AETHER Personal AI Agent](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Core Architecture & Capabilities

```
User Input / Voice
      ↓
Intent Detection & Memory Extraction
      ↓
Memory Retrieval (MongoDB Top-K Relevant Context)
      ↓
Context Assembly (Persona + Instructions + History)
      ↓
LLM Reasoning (Ollama llama3.1:8b / Adaptive Fallback)
      ↓
Tool Selection & Execution (Web Search, Puppeteer, Tasks, RAG, Calculator)
      ↓
Confirmation Checkpoint (For High-Risk Actions)
      ↓
Streaming Synthesis & Real-Time SSE Telemetry
      ↓
3D Avatar Animation (React Three Fiber State Reactivity)
      ↓
Voice Response (Web Speech API Synthesis)
```

---

## 🚀 Key Features

### 1. 3D AI Companion Avatar
- Built with **Three.js** and **React Three Fiber**.
- **8 Dynamic Reactive States**:
  - `IDLE`: Levitation, organic breathing, gentle orbital rotations.
  - `LISTENING`: Acoustic halo expansion, attentive pupil dilation.
  - `THINKING`: Rapid orbital ring acceleration, neural matrix particle flow.
  - `SEARCHING`: Radar sweeping beam effect with scanning rings.
  - `EXECUTING`: Cybernetic data pulse streams with mechanical rotations.
  - `SPEAKING`: Visor frequency waveform morphing synchronized with Web Speech Synthesis.
  - `SUCCESS`: Radiant emerald/cyan energy bloom.
  - `ERROR`: Amber/crimson warning ring alert.

### 2. Local-First AI Engine (Ollama)
- Default Model: `llama3.1:8b`.
- **Zero hardcoding**: Designed with an abstract `AIProvider` base class and dynamic `AIService` switcher.
- **Adaptive Fallback**: The app stays fully responsive and functional even before Ollama models are downloaded, guiding you step-by-step.

### 3. Voice Input & Text-to-Speech
- **Speech Recognition**: Uses the browser's native Web Speech API with live transcript streaming and automatic voice activity states.
- **Speech Synthesis**: Clean speech reading with automated filters that strip markdown syntax, code blocks, URLs, and tool traces before vocalizing.
- **Voice Mode**: Full-screen immersive voice interaction mode with the centered 3D avatar.

### 4. Intelligent Tool Registry
- **12 Production Tools** with strict schema validation:
  - `webSearch`: Live internet search (Tavily, DuckDuckGo, Wikipedia fallback).
  - `openWebPage`: Puppeteer browser navigation and clean content extraction.
  - `browserAutomation`: Controlled Puppeteer actions (navigate, screenshot, click, type).
  - `createTask`: Natural language task and reminder creation.
  - `getTasks`: Task retrieval and status filtering.
  - `saveMemory`: Persistent long-term user memory storage.
  - `searchMemory`: Semantic and keyword memory search.
  - `knowledgeSearch`: Local RAG document retrieval.
  - `summarizeContent`: Text and data condenser.
  - `generateDocument`: Formal drafts (emails, letters, articles).
  - `calculator`: Safe mathematical expression evaluation.
  - `getCurrentTime`: Local date, time, and timezone information.
- **Security Policy**: Risk tiers (`READ_ONLY`, `LOW_RISK`, `REQUIRES_CONFIRMATION`) with real-time approval modals for sensitive operations.

### 5. Persistent Memory Pipeline
- **Short-Term Memory**: Conversation history with compaction.
- **Long-Term Memory**: Evaluates user inputs for facts, preferences, project details, and goals with importance scores (1–10).
- **Memory Explorer**: Visual UI to view, edit, search, and manage memories.

### 6. Local RAG Knowledge Base
- Ingest and index PDF, Markdown, and plain text files.
- Text chunking (500–600 tokens with 100 token overlap).
- Semantic chunk retrieval directly callable by the AI agent during conversations.

### 7. Smart Tasks & Automation Studio
- Natural language task parsing (e.g., *"Remind me tomorrow at 10 AM to call John"*).
- Cron-based **Automation Engine** capable of multi-step action chains (e.g. search web → summarize → save task).
- Execution history with timestamped logs and status indicators.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Webpack 5, Babel, Tailwind CSS, Three.js, `@react-three/fiber`, `@react-three/drei`, GSAP, Lucide React, Axios, React Router.
- **Backend**: Node.js (ESM), Express.js, MongoDB, Mongoose, Puppeteer, Server-Sent Events (SSE), Multer, `pdf-parse`, `node-cron`.
- **Local AI**: Ollama (`llama3.1:8b`, `nomic-embed-text`).

---

## 📦 Getting Started

### Prerequisites

1. **Node.js**: v18.0.0 or later (`node -v`)
2. **MongoDB**: Running locally at `mongodb://localhost:27017`
3. **Ollama** (Optional for local LLM inference): [Download Ollama](https://ollama.com/)

### 1. Installation

Clone or open the repository and install all dependencies:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or install individually:
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Environment Setup

Copy `.env.example` to `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai_personal_agent
OLLAMA_BASE_URL=http://127.0.0.1:11434
DEFAULT_MODEL=llama3.1:8b
EMBEDDING_MODEL=nomic-embed-text
PUPPETEER_HEADLESS=true
```

### 3. Local Model Setup (Ollama)

Run the following command in a terminal to pull the default model:

```bash
# Pull Llama 3.1 8B
ollama run llama3.1:8b

# Pull embedding model for RAG (optional)
ollama pull nomic-embed-text
```

*Note: If Ollama is not installed or running, AETHER automatically falls back to adaptive agent mode so you can test and explore immediately without errors.*

---

## 🏃 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both backend server (port 5000) and React frontend (port 3000) concurrently |
| `npm run server` | Starts Express server in development mode |
| `npm run client` | Starts React development server on `http://localhost:3000` |
| `npm run build` | Builds optimized production bundle of the React client |
| `npm start` | Runs the production backend server |

---

## 🧪 Automated Testing

Run the automated backend test suite:

```bash
cd server
node test/system.test.js
```

All 13 integration tests verify:
- MongoDB connection
- Ollama & Fallback health status
- Model listing
- Tool execution (`calculator`, `webSearch`, `getCurrentTime`, `createTask`, `getTasks`)
- Memory extraction and similarity retrieval
- RAG document parsing, chunking, and search
