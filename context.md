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
| Jul 3 | Complete Phase 2 — real git + Slack ingestion |
| Jul 4 (Today) | Complete Phase 3 — danger score system + Phase 4 frontend polish |
| Jul 5 AM | Phase 5 — README, demo video, submission |
| Jul 5 EOD | Submit before deadline ✅ |

---

## 9. Official Cognee Docs Reference (Key Notes for This Project)

> Source: docs.cognee.ai — read on Jul 4, 2026

### Installation
- Requires **Python 3.10 – 3.14**
- Our setup: `pip install "cognee[groq]"` — Groq requires the extra package
- Virtual environment must be active before installing

### Environment Configuration (`.env`)
Cognee needs **two things configured separately** — the LLM and the Embedding provider.
If you only set the LLM provider but not embeddings, it silently falls back to OpenAI for embeddings. This is a common gotcha.

**Our `.env` must have both:**
```dotenv
# LLM — Groq
LLM_PROVIDER="groq"
LLM_MODEL="groq/gpt-oss-20b"
LLM_API_KEY="gsk_..."

# Embeddings — since Groq doesn't provide embeddings, we need a separate provider
# Options: OpenAI (paid), Fastembed (free, local), Gemini (free tier)
# Recommended for us: Fastembed (no API key, runs locally, free)
EMBEDDING_PROVIDER="fastembed"
EMBEDDING_MODEL="sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSIONS="384"
```

> If embedding provider changes after a previous run, reset with:
> ```python
> await cognee.prune.prune_system(metadata=True)
> ```

### Installing the Groq Extra
```bash
pip install "cognee[groq]"
# If using Fastembed for embeddings:
pip install "cognee[groq,fastembed]"
```

### The 4 Core Operations (how we use them)

| Operation | What it does | How we use it |
|---|---|---|
| `cognee.remember(text)` | Ingests text → chunks → extracts entities → builds knowledge graph | Ingest git commits, PRs, Slack messages, incident reports |
| `cognee.recall(query_text="...")` | Auto-routes query to best retrieval strategy (vector or graph traversal) | Answer "why is DB_POOL_SIZE set to 10?" |
| `cognee.improve()` | Re-weights graph edges based on feedback, prunes stale nodes | Called after each engineer feedback (safe/incident) |
| `cognee.forget(dataset="...")` | Surgically removes data without corrupting shared context | Remove stale config history when a service is decommissioned |

### Smoke Test (verify setup works)
Run this before anything else to verify the full pipeline works:
```python
import asyncio
import cognee

async def main():
    await cognee.forget(everything=True)
    await cognee.remember("DB_POOL_SIZE was set to 10 after the March 2024 OOM incident.")
    results = await cognee.recall(query_text="Why is DB_POOL_SIZE set to 10?")
    for result in results:
        print(result.text)

asyncio.run(main())
```

### Async Rules
- Cognee is **fully async** — all core functions must be called with `await`
- Wrap everything in `async def main()` and run with `asyncio.run(main())`
- Our FastAPI routes already handle this correctly since FastAPI supports async route handlers natively

### Dataset Scoping (important for our project)
We scope every `remember()` call to a dataset so we can query them separately:
```python
await cognee.remember(commit_text, dataset_name="git_history")
await cognee.remember(slack_text, dataset_name="slack_threads")
await cognee.remember(incident_text, dataset_name="incidents")

# Query across all or specific datasets
results = await cognee.recall("Why is X set?", datasets=["git_history", "incidents"])
```

### Dependency Map for our stack
| Need | Install |
|---|---|
| Groq LLM | `pip install "cognee[groq]"` |
| Fastembed (local embeddings, free) | `pip install "cognee[fastembed]"` |
| PostgreSQL (if we upgrade from SQLite) | `pip install "cognee[postgres]"` |
| Scraping URLs | `pip install "cognee[scraping]"` |

---

## 10. Features Log — July 4 Update

- **[2026-07-04] Cognee Official Docs Reviewed**:
  - Identified critical gap: Groq does NOT provide embeddings. We need a separate embedding provider.
  - Decided to use **Fastembed** (local, free, no API key) for embeddings.
  - Need to install `cognee[groq,fastembed]` and update `.env` with `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS`.
  - Documented all 4 operations (`remember`, `recall`, `improve`, `forget`) with our specific use-cases mapped to each.
  - Need to run smoke test to validate the full pipeline end-to-end.

- **[2026-07-04] ✅ Smoke Test PASSED — Full Pipeline Working**:
  - After several debugging rounds, the Cognee + Groq + Fastembed pipeline is fully functional.
  - **Final working `.env` config:**
    - `LLM_PROVIDER=custom` (Cognee's enum doesn't have "groq", but "custom" works)
    - `LLM_MODEL=groq/llama-3.3-70b-versatile` (the `groq/` prefix is needed for litellm routing)
    - `LLM_ENDPOINT=https://api.groq.com/openai/v1`
    - `EMBEDDING_PROVIDER=fastembed` + `EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2`
    - `COGNEE_SKIP_CONNECTION_TEST=true` (Cognee's preflight test times out with custom endpoints)
  - **Smoke test result** — Query: *"Why is DB_POOL_SIZE set to 10?"*
    - Answer: *"DB_POOL_SIZE is set to 10 because at a connection pool size of 20, the t2.micro server with 512MB RAM experienced out-of-memory (OOM) errors, and load tests confirmed that 10 is the maximum stable connection count."*
    - Retrieval strategy used: `GRAPH_COMPLETION_COT` (chain-of-thought graph traversal) ✅
  - Groq free tier rate limits (12,000 TPM) were hit during ingestion but Cognee's **automatic retry (tenacity)** handled them gracefully — no manual intervention needed.
  - **Phase 1 is now 100% complete. Ready for Phase 2.**

- **[2026-07-04] 🏆 Phase 2 & Phase 3 Complete — The "Best of the Best" Hackathon Architecture**:
  - **Core Ingestion Engine Built (`services/`)**:
    - `git_ingester.py`: Scans git history (`gitpython`) for config file diffs (`.env`, `*.yaml`, `*.json`, `settings.py`), author provenance, and timestamps.
    - `pr_ingester.py`: Fetches GitHub PR discussions and diffs (`requests`).
    - `incident_ingester.py`: Ingests post-mortem markdown reports into dataset `"incidents"`.
    - `slack_ingester.py`: Ingests emergency engineering chat threads into `"slack_threads"`.
  - **Autonomous Git Pre-Commit Guardrail (`services/git_hook.py`)**:
    - Intercepts `git commit`, parses staged diffs, calculates Danger Scores, and **blocks commits** if a developer attempts to change a variable (e.g., `DB_POOL_SIZE=20`) that caused a historical production outage!
    - Includes `capi install-hook` to deploy the guardrail into `.git/hooks/pre-commit`.
  - **Danger Score Engine & Safe Range Prediction (`services/danger_score.py`)**:
    - Derives numerical 0–100 risk ratings, badges (🟢 SAFE / 🟡 CAUTION / 🔴 DANGER), and safe boundaries (e.g. `5 ≤ DB_POOL_SIZE ≤ 15`) from historical outage links and SQLite feedback tracking.
  - **The Capi CLI Tool (`backend/cli.py` & root `/home/akarsh/Capi/capi`)**:
    - Powerful Typer + Rich terminal UI with commands: `query`, `blame` (semantic why-explainer), `check`, `install-hook`, `demo`, `serve`, and `ingest`.
  - **Full UI Integration & Interactive ECL Visual Graph (`frontend/`)**:
    - Updated FastAPI `api/routes.py` with `/api/query`, `/api/demo`, `/api/graph`, and `/api/feedback`.
    - Updated React dashboard with an interactive SVG force-directed node graph, Danger Score banners, and One-Click Demo button (`⚡ One-Click E-Commerce Outage Demo`).
  - **Status**: Ready for Hackathon presentation, video recording, and submission!

- **[2026-07-04] 🌐 Phase 4 Complete — Real-World Dynamic Archaeology & Ingestion Hub**:
  - **Real-World Ingestion Hub (`frontend/src/components/IngestHub.jsx`)**:
    - Built an interactive accordion dashboard panel allowing engineers to directly connect Capi to their real-world workflows:
      1. **Git Repo Scanner**: Scans local commit histories (`/home/akarsh/Capi` or custom paths) for variable declarations and diffs.
      2. **GitHub PR Ingester**: Connects to GitHub API to pull PR discussions and code review debates (`fastapi/fastapi`, etc.).
      3. **Incident / Outage Uploader**: Allows instant pasting of post-mortem reports and Slack thread exports into Cognee graph memory.
  - **Dynamic Orbital Knowledge Graph (`ContextGraph.jsx`)**:
    - Replaced hardcoded demo positions with a dynamic circular geometric orbit math algorithm. Whatever nodes Cognee returns—whether 2 commits or 15 PRs—they orbit dynamically around the searched variable node with SVG causal connectors (`MODIFIED_IN`, `CAUSED_BY`, `DISCUSSED_IN`, `DEFINED_IN`).
  - **Offline & Rate-Limit Resilient Engine (`api/routes.py` & `git_ingester.py`)**:
    - Upgraded `git_ingester.py` with regex matching across all code files (`.env*`, `*.json`, `*.yaml`, `*.py`, etc.) for uppercase variable assignments (`PORT`, `LLM_MODEL`, `TIMEOUT`).
    - Added lightning-fast 0.01s local Git Archaeology fallbacks in `/api/query` and a 2-second timeout on LLM network calls, ensuring Capi never hangs or crashes even if Groq free tier daily token limits are reached!


