# 💡 Capi — Config Archaeology & Vegas Detective Investigation Board
> **Autonomous AI Configuration Guardrails & Self-Improving Provenance Knowledge Graph**
> Built with Cognee Neuro-Symbolic Memory Layer, Python FastAPI, Next.js 14 (App Router), Tailwind CSS, and shadcn/ui.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Cognee](https://img.shields.io/badge/Memory%20Layer-Cognee-00f0ff.svg)](https://github.com/topoteretes/cognee)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014%20App%20Router-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2F%20Python-009688.svg)](https://fastapi.tiangolo.com)
[![OWASP Hardened](https://img.shields.io/badge/Security-OWASP%20Hardened-emerald.svg)]()
[![Deploy on Render](https://img.shields.io/badge/Deploy-Render%20Free%20Tier-46E3B7.svg)](https://render.com)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000.svg)](https://vercel.com)

---

## 🎲 The Concept: Vegas Detective Crime Scene Investigation
Every engineering team has configuration files full of mystery values (`DB_POOL_SIZE=10`, `REQUEST_TIMEOUT=30000`, `MAX_RETRIES=3`). Nobody knows why they exist or what breaks if they change. Engineers check `git blame` (which only shows *"fix config"* by someone who left 8 months ago), search Slack (nothing), and make a blind judgment call. They deploy—and production crashes.

**Capi solves configuration drift and mystery values forever.** Inspired by *The Hangover* movie—piecing together what happened the night before from scattered clues, receipts, and memories—Capi treats your `.env` config file as a **Vegas crime scene**. You are the detective. Every commit, PR, and incident report is a piece of evidence. Capi ingests these scattered artifacts into a **Cognee hybrid vector-relational knowledge graph**, allowing engineers to query any config key and instantly unearth its full provenance, blast radius, and safe operating boundaries!

---

## ✨ Key Features & Architectural Innovation

- **🕵️‍♂️ Vegas Detective UI & Case File Cards**: A dark, moody, amber-lit dashboard styled like a Vegas detective's office at 3am. Features interactive **Case File Cards** displaying real-time Danger Score gauges (`0-100`), safe boundary sliders (`5.0 ≤ value ≤ 15.0`), and chronological evidence logs.
- **🚀 Zero-Cloning Frictionless Onboarding**: Developers **do not need to clone this repository** to consume Capi guardrails! Drop Capi into any project via:
  - **1-Line Package Install** (`pip install git+https://github.com/Akarshkushwaha/Capi.git`)
  - **Git Pre-Commit Guardrail Hook** (`capi install-hook` automatically audits staged `.env` files before commits)
  - **GitHub Actions CI/CD Pipeline** (Automated PR comments and CI blocking when danger boundaries are breached)
- **🧠 Neuro-Symbolic Config Archaeology**: Uses Cognee's LLM reasoning engine to walk backward through Git history (`git log -p -S`), GitHub Pull Request discussions, and post-mortem logs, constructing a multi-dimensional relational graph linking config keys directly to developers (`@jdoe`) and historical outages (`INC-47`).
- **🌌 Interactive 2D Evidence Board (`/graph`)**: A physics force-directed graph (`react-force-graph-2d`) rendering microservice dependencies, commit diffs, pull requests, and P-Incident badges in real time with neon glow aesthetics.
- **🔄 Self-Improving Feedback Loops (`cognee.improve`)**:
  - **🚨 Negative Feedback (Outage Reports)**: Instantly penalizes a variable's Danger Score (`+20`) in graph memory when an outage occurs so no engineer repeats the mistake.
  - **✅ Positive Feedback (Safe Deployments)**: Rewards clean deployments by reducing the Danger Score (`-10`), keeping risk metrics accurate over time.
- **🛡️ Comprehensive OWASP Security Hardened**:
  - Strict **Pydantic input validation** with regex pattern matching and length caps against NoSQL/graph injection.
  - Secure **CORS Middleware** preventing wildcard credential exposure (`allow_credentials=False` on `*`).
  - Parameterized SQLite query binding (`?`) with 0% SQL injection risk.
  - Strict POSIX file permissions (`0o755`) enforced on generated Git hooks.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    A[Git Commits / GitHub PRs / Incident Logs / .env Files] -->|Ingestion Engine| B[Capi CLI Hub / FastAPI Layer]
    B -->|cognee.add & cognee.cognify| C[Cognee Neuro-Symbolic Graph & Vector Memory]
    C <-->|cognee.improve| D[Self-Improving Negative/Positive Feedback Loop]
    E[Next.js 14 Vegas Detective Dashboard] <-->|REST JSON / Port 8001| F[FastAPI Backend Server]
    F <-->|Graph & Provenance Retrieval| C
    E --> G[Mission Control Case File Cards]
    E --> H[Evidence Board /graph Explorer]
    I[Git Pre-Commit Hook / CI-CD Pipeline] -->|Automated Audit| B
```

---

## 🚀 Zero-Cloning Installation & Usage

You don't need to clone Capi to use its guardrails in your own project! Choose the installation method that fits your workflow:

### Method 1: Instant CLI Installation (Recommended)
Install Capi directly via Python package manager:
```bash
pip install git+https://github.com/Akarshkushwaha/Capi.git
# Or run using local wrapper:
./capi --help
```

### Method 2: Git Pre-Commit Guardrail Hook
Install an automated guardrail into any local Git repository. Every time you run `git commit`, Capi will automatically audit your `.env` changes against historical outage memory:
```bash
# Inside your project repo:
capi install-hook

# When you commit staged .env changes, Capi runs:
# 🛡️ Capi Automated Config Safety Audit -> Blocks commit if DANGER score > 40!
```

### Method 3: GitHub Actions CI/CD Pipeline
Add automated PR guardrails to your repository by creating `.github/workflows/capi-guardrail.yml`:
```yaml
name: 🛡️ Capi Config Archaeology Guardrail
on: [pull_request]
jobs:
  audit-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Capi & Run Audit
        run: |
          pip install git+https://github.com/Akarshkushwaha/Capi.git
          capi check .env.example --service payments-api
```

---

## 🛠️ Complete CLI Command Reference

Capi provides a rich, interactive terminal suite built with Typer and Rich formatting:

| Command | Example Usage | Description |
| :--- | :--- | :--- |
| **`capi query`** | `capi query --key DB_POOL_SIZE -s payments-api` | **The Money Shot**: Scans graph memory and outputs a Vegas Case File card with risk scores, safe boundaries, and commit provenance. |
| **`capi check`** | `capi check .env.example -s payments-api` | Audits an entire `.env` file in batch and outputs an ASCII safety audit table (`SAFE`, `CAUTION`, `DANGER`). |
| **`capi ingest`** | `capi ingest git . -s payments-api` | Ingests Git commit history (`git`), GitHub Pull Requests (`prs`), or post-mortem logs (`incidents`) into Cognee vector graph memory. |
| **`capi incident`** | `capi incident -k DB_POOL_SIZE -n "OOM crash" -sev P1` | Records a production outage and triggers `cognee.improve()` **negative feedback loop** (`+20` Danger Score). |
| **`capi safe`** | `capi safe -k DB_POOL_SIZE -s payments-api` | Records a clean deployment and triggers `cognee.improve()` **positive feedback loop** (`-10` Danger Score). |
| **`capi install-hook`** | `capi install-hook` | Installs executable `.git/hooks/pre-commit` guardrail script with strict `0o755` permissions. |
| **`capi deprecate`** | `capi deprecate -s payments-api` | Clears and resets Cognee memory datasets for a target microservice. |

---

## ☁️ One-Click Cloud Deployment (Render & Vercel)

Capi is fully containerized with multi-stage Dockerfiles and optimized for **100% Free Tier Cloud Deployment**:

### 1. Backend Server (Render.com)
The FastAPI backend is configured via `render.yaml` and `Dockerfile.backend` for Render Free Tier:
1. In Render Dashboard, click **New > Blueprint** and select your repository.
2. Render automatically builds `Dockerfile.backend` and launches the web service on `https://capi-backend.onrender.com`.
3. *(Note: Configured without disk volume requirements for seamless Free Tier compatibility).*

### 2. Frontend Dashboard (Vercel)
The Next.js 14 dashboard is configured via `dashboard/vercel.json` and `dashboard/Dockerfile`:
1. In Vercel, click **Add New Project** and select your GitHub repository.
2. Set **Root Directory** to `dashboard`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-render-backend.onrender.com`
4. Click **Deploy**! Your Vegas Detective Suite will be globally live in under 60 seconds!

---

## 📡 REST API Reference Table (Port 8001)

| Endpoint | Method | Description | Payload / Params |
| :--- | :---: | :--- | :--- |
| `/query` | `POST` | Perform config archaeology scan on a variable | `{"key": "DB_POOL_SIZE", "service": "payments-api"}` |
| `/incident` | `POST` | Record outage & trigger negative feedback (`+20` risk) | `{"key": "...", "service": "...", "notes": "...", "severity": "P1"}` |
| `/safe` | `POST` | Record clean deployment & trigger positive feedback (`-10` risk) | `{"key": "...", "service": "..."}` |
| `/graph` | `GET` | Fetch nodes and links for 2D force graph explorer | `?service=payments-api` |
| `/health` | `GET` | Check engine connection status & Cognee memory mode | None |

---

## 🌐 Cognee Cloud vs. Open Source Mode

Capi natively supports both local development and enterprise cloud deployments:
- **Local Open Source Mode (`COGNEE_MODE=local` / default)**: Uses local FastEmbed embeddings and SQLite vector/graph storage (`.cognee_data/databases`) for lightning-fast, zero-cost developer workflows and offline resilience.
- **Cognee Cloud Mode (`COGNEE_MODE=cloud`)**: Seamlessly connects to managed Cognee Cloud graph tenants by setting `COGNEE_API_KEY` in `.env`, enabling centralized multi-team graph synchronization across distributed CI/CD pipelines.

---

## 🏆 Built for the Cognee AI Hackathon
Built by **Team Capi** to demonstrate how Neuro-Symbolic AI memory layers transform software engineering culture from reactive firefighting to autonomous, self-improving configuration guardrails.
