# Context: Config Archaeology for "The Hangover: Part AI"

This document provides a comprehensive overview of the project, the hackathon it was built for, the underlying technology, and how everything integrates together.

## 1. The Hackathon
**Name:** The Hangover: Part AI — Where's My Context?  
**Organizer:** WeMakeDevs  
**Theme:** "Give your AI a memory."  
**Mission:** Standard LLM calls are stateless; they wake up with amnesia every session. The goal of this hackathon is to build applications, agents, or tools that leverage persistent memory. 

## 2. What We Are Building
**Project Name:** Config Archaeology — "Why is this value 10 and not 20?"  
**Target Category:** Self-Improving Agents  

**The Problem:** Every codebase has mystery configuration values (e.g., `DB_POOL_SIZE=10`, `REQUEST_TIMEOUT=30000`). The reasoning behind these values is often lost in old Slack threads, incident reports, or vague PR descriptions. When new engineers change these values without context, it causes production incidents.

**The Solution:** Config Archaeology ingests organizational history (git blame, PRs, Slack messages, incident reports) and builds a knowledge graph connecting config keys to their origins. 
- When someone queries a config key, the system recalls its history and explains *why* it was set to a specific value.
- If a config change causes an incident, engineers can provide feedback. The system uses this to increase the "danger score" of that config key, acting as a self-improving memory graph.

## 3. What Cognee Is
**Cognee** is an open-source, self-hosted AI memory platform. It gives agents persistent long-term memory using a hybrid graph-vector knowledge engine.
- Instead of standard RAG (which treats documents as flat text), Cognee extracts entities and maps their relationships into a structured knowledge graph (using tools like Kuzu or Neo4j) and a vector store (like LanceDB).
- **Core Operations:**
  - `remember()`: Ingests text/data into the knowledge graph (Extract, Cognify, Load).
  - `recall()`: Queries memory using semantic similarity and deep graph traversals.
  - `improve()`: Re-weights the memory graph based on feedback and usage, allowing the system to get *smarter*, not just bigger.
  - `forget()`: Prunes irrelevant datasets or nodes.

## 4. How Everything Integrates

Our architecture is split into a Python backend and a React frontend.

### Backend (FastAPI + Cognee)
Located in `/backend`.
- **FastAPI** exposes REST endpoints (`/api/ingest`, `/api/query`, `/api/feedback`).
- **Cognee** is integrated directly into these routes. When the server starts, a `mock_loader.py` script automatically calls `cognee.remember()` to ingest sample PRs and Slack messages.
- When the frontend requests context, the backend calls `cognee.recall()` and returns the relationship graph.
- When feedback is provided (e.g., "This deploy caused an incident"), the backend calls `cognee.improve()` to adjust the graph weights.

### Frontend (React + Vite)
Located in `/frontend`.
- Built with **React** and **Vite**, using **Vanilla CSS** to achieve a premium, glassmorphism design (no Tailwind).
- **User Flow:** 
  1. The user types a config key (like `DB_POOL_SIZE`) into the SearchBar.
  2. The frontend fetches the context from the FastAPI backend and displays it in a visual ContextGraph.
  3. A FeedbackPanel allows the user to click "Safe Deploy" or "Caused Incident," which triggers the backend's `improve()` API, completing the self-improving agent loop.

### Running the Stack
1. **Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Navigate to the local Vite URL (usually `http://localhost:5173/`) to use the application.

## 5. Hackathon Judging Criteria
The project will be evaluated based on 6 dimensions:
1. **Potential Impact**: Does it address a meaningful problem or unlock a valuable use case with persistent AI memory?
2. **Creativity & Innovation**: How unique is the idea? Does it push what's possible when an agent never forgets?
3. **Technical Excellence**: How well implemented? Strong engineering practices and clean, maintainable code?
4. **Best Use of Cognee**: How deeply does the project use Cognee's memory lifecycle APIs and hybrid graph-vector memory layer?
5. **User Experience**: Is it intuitive? Would users actually adopt it?
6. **Presentation Quality**: Demo, README, submission — do they clearly communicate the problem, solution, and impact?

## 6. Cognee Cloud Infrastructure & Billing
For this project, we are utilizing the **Free Cognee Cloud Developer plan ($35 value)** (claimed with code `COGNEE-35`).
- **Available Credits**: $37.50
- **Pricing**: $2.50 per 1,000,000 tokens; $5/month per workspace.
- **Included in Plan**:
  - 1,000,000 tokens
  - Unlimited users
  - Unlimited API calls
  - Agentic integrations (Claude Code, Codex, MCP)
  - Data source integrations (Slack, Notion, Google Drive)

## 7. Features Log & Updates
*(This section will be updated with all features we work on from now on.)*

- **[2026-07-02] Project Scaffolding & Initial Implementation**:
  - Implemented the FastAPI backend integrating Cognee's `remember()`, `recall()`, and `improve()` functions.
  - Implemented the Vite + React frontend with a premium, glassmorphism design.
  - Built the `SearchBar` for querying config values, the `ContextGraph` for displaying historical data, and the `FeedbackPanel` for triggering Cognee's self-improvement memory loops.
  - Initialized a Git repository and committed the project scaffolding locally.

- **[2026-07-02] Cognee Cloud Integration**:
  - Configured `python-dotenv` in the backend to load `.env` variables.
  - Added `.env.example` and `.env` templates for `COGNEE_API_URL`, `COGNEE_API_KEY`, and `OPENAI_API_KEY` to seamlessly switch from local file storage to the Cognee Cloud managed platform.

- **[2026-07-02] Alternative LLM Integration (Groq & OpenRouter)**:
  - Updated the `.env.example` configurations to show how to use alternate LLM providers like Groq or OpenRouter instead of OpenAI.
  - Cognee uses `litellm` under the hood, allowing users to configure `LLM_PROVIDER`, `LLM_MODEL`, and `LLM_API_KEY` to connect to almost any open-source or commercial model.
  - Fixed `.env` to use correct Groq env variable names (`LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`).
  - Updated model from deprecated `llama3-8b-8192` to Groq's recommended **GPT OSS 20B** (`groq/gpt-oss-20b`).

- **[2026-07-02] Mid-Hackathon Discord Check-in**:
  - Shared project progress on WeMakeDevs Discord for the Jul 02 mid-hackathon check-in (8:30 PM IST).
  - Message shared: building Config Archaeology, FastAPI + Cognee Cloud + Groq + React, self-improvement loop with danger scores on config keys.

---

## 8. Complete Implementation Roadmap (Start to Finish)

This is the full plan — what is done, what is in progress, and what still needs to be built.

### ✅ Phase 1 — Foundation (DONE)
- [x] Backend scaffolded: `main.py`, `api/routes.py`, `services/mock_loader.py`
- [x] FastAPI endpoints: `/api/ingest`, `/api/query`, `/api/feedback`, `/api/forget`
- [x] Cognee `remember()` / `recall()` / `improve()` / `forget()` wired to endpoints
- [x] Mock data loader: seeds graph with sample Slack threads, PRs, and incident reports on startup
- [x] Frontend scaffolded: Vite + React with Vanilla CSS glassmorphism dark UI
- [x] Components: `SearchBar`, `ContextGraph`, `FeedbackPanel`
- [x] Git repo initialized, `.gitignore` configured, pushed to GitHub
- [x] Cognee Cloud connected via `.env` (`COGNEE_API_URL` + `COGNEE_API_KEY`)
- [x] Groq API configured as LLM provider (`gpt-oss-20b`)

---

### 🔧 Phase 2 — Real Data Ingestion (NEXT)
Make the tool actually useful on a real codebase, not just mock data.

- [ ] **Git Ingestion Service** (`services/git_ingester.py`):
  - Parse `git log --follow -p -- <config_file>` to extract commit messages, authors, and dates for every change to config files.
  - Format each commit as a text chunk and call `cognee.remember()` with `dataset_name="git_history"`.

- [ ] **GitHub PR Ingestion** (`services/pr_ingester.py`):
  - Use GitHub REST API (`/repos/{owner}/{repo}/pulls`) to fetch PR titles, descriptions, and file diffs.
  - Filter PRs that touched config files and ingest their descriptions.

- [ ] **Slack Export Ingestion** (`services/slack_ingester.py`):
  - Accept a Slack export JSON (from Slack's export tool).
  - Parse channel messages and thread replies, filter by keywords (config key names).
  - Ingest relevant threads into Cognee.

- [ ] **Incident Report Ingestion** (`services/incident_ingester.py`):
  - Accept markdown or text incident reports.
  - Ingest with `dataset_name="incidents"`.

- [ ] **Upload Endpoint** (`POST /api/upload`):
  - Accept file uploads from the UI (git log exports, Slack JSON, incident markdown).
  - Route to the right ingestion service.

---

### 🧠 Phase 3 — Self-Improving Danger Score (CORE FEATURE)
This is the centrepiece of the "Self-Improving Agents" category.

- [ ] **Danger Score Model** (`services/danger_score.py`):
  - Track per-config-key metadata: number of incidents, number of safe deploys, last changed date.
  - Store this in a lightweight SQLite table alongside Cognee's graph.

- [ ] **Improve Loop**:
  - When feedback is submitted via `POST /api/feedback`:
    - If `correct=False` (incident): increment incident counter → call `cognee.improve()` with negative feedback → bump danger score.
    - If `correct=True` (safe): increment safe counter → call `cognee.improve()` with positive feedback → soften danger score.

- [ ] **Danger Score in Recall Response**:
  - When `GET /api/query` is called, append the danger score and a human-readable warning level (`SAFE`, `CAUTION`, `DANGER`) to the response.
  - Frontend renders the score as a color-coded badge (green/yellow/red).

---

### 🎨 Phase 4 — Frontend Polish
Make the UI ready for the demo video.

- [ ] **Danger Badge Component**: Color-coded indicator (green = safe, yellow = caution, red = danger) displayed next to the config key name.
- [ ] **Timeline View**: Display the recalled context as a vertical timeline (oldest → newest) instead of a flat list. Show commit → PR → Slack thread → Incident as connected events.
- [ ] **Upload UI**: Drag-and-drop panel to upload git log exports, Slack JSON, and incident markdown files to trigger ingestion.
- [ ] **Ingestion Status Panel**: Show real-time ingestion progress (polling `/api/status`).
- [ ] **Toast Notifications**: Show success/error toasts for feedback submissions and ingestion completions.
- [ ] **Config File Scanner**: Let users paste their `.env` file and auto-extract all keys to show in a dashboard grid.

---

### 🚀 Phase 5 — Demo Prep & Submission
Everything needed to win on Presentation Quality.

- [ ] **README.md**: Write a compelling README with the problem, solution, architecture diagram, setup instructions, and demo GIF.
- [ ] **Demo Video**: Record a 2–3 min walkthrough:
  1. Show a mystery config value in a codebase.
  2. Run Config Archaeology → instantly get the context.
  3. Simulate a bad deploy → submit "caused incident" feedback.
  4. Re-query → show the danger score increased.
- [ ] **Architecture Diagram**: Create a visual flow: Data Sources → Ingestion → Cognee ECL → Graph/Vector Store → FastAPI → React UI → Feedback → `improve()`.
- [ ] **Submission Form**: Fill in the WeMakeDevs submission form before July 5 end of day.
- [ ] **Social Post**: Tweet/post tagging `@wemakedevs` and `@cognee` for the social buzz side track (top 10 posts get swag).
- [ ] **Blog Post** (optional): Write about the build for the Keychron side track prize.

---

### 📅 Remaining Timeline
| Day | Goal |
|-----|------|
| Jul 3 (Today) | Complete Phase 2 — real git + Slack ingestion |
| Jul 4 | Complete Phase 3 — danger score system |
| Jul 4 | Complete Phase 4 — frontend polish |
| Jul 5 AM | Phase 5 — README, demo video, submission |
| Jul 5 EOD | Submit before deadline ✅ |
