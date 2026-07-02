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
