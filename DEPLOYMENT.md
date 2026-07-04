# Capi (Config Archaeology) — Production Deployment Architecture & Guide

Capi is a self-improving memory layer and pre-commit guardrail for engineering teams. It is architected as a container-native, cloud-ready full-stack suite.

---

## 🏗️ Architecture Summary

Capi consists of three deployable layers:
1. **FastAPI & Cognee Backend (`8001`)**: Handles vector embedding generation (`fastembed`), Git commit history parsing (`GitPython`), PR review reasoning ingestion (`PyGithub`), and graph storage (`SQLite` in `.cognee_data/`).
2. **Next.js 14 Vegas Detective Dashboard (`3000`)**: Interactive visual investigation board and mission control.
3. **Standalone CLI & Git Hook**: Distributed via pip and pre-commit framework for local repository guardrails.

---

## 🚀 Deployment Option 1: Docker Compose (Recommended for Self-Hosting / VPS)

Deploy both the backend and frontend on any Linux server (AWS EC2, Google Cloud Compute Engine, DigitalOcean Droplet, Hetzner) with a single command. Our `docker-compose.yml` configures persistent storage volumes (`cognee_storage`) so your vector knowledge graph survives container restarts.

### 1. Clone & Configure Environment
```bash
git clone https://github.com/Akarshkushwaha/Capi.git
cd Capi

# Create `.env` file from example
cp .env.example .env
```
Edit `.env` and insert your required **Groq API Key**:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
COGNEE_MODE=open_source
```

### 2. Launch Suite
```bash
docker compose up -d --build
```
* **Backend API**: Running on `http://localhost:8001`
* **Frontend Dashboard**: Running on `http://localhost:3000`

---

## ☁️ Deployment Option 2: 1-Click Cloud Platform Duo (Render.com + Vercel)

For zero-server maintenance, deploy the backend to Render and the dashboard to Vercel. Both platforms offer generous free tiers suitable for hackathons and team trials.

### Step A: Deploy Backend to Render.com
1. Log in to your [Render Dashboard](https://dashboard.render.com/) and select **New > Blueprint**.
2. Connect your GitHub repository: `https://github.com/Akarshkushwaha/Capi`.
3. Render will auto-detect the **`render.yaml`** Blueprint in the root directory and provision:
   * `capi-backend` (using `Dockerfile.backend` with a 1GB persistent disk mounted at `/app/.cognee_data`).
4. In the Render environment settings, enter your `GROQ_API_KEY`.
5. Copy your new backend URL (e.g., `https://capi-backend-xxxx.onrender.com`).

### Step B: Deploy Dashboard to Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Select your Capi GitHub repository and set the **Root Directory** to `dashboard`.
3. Under **Environment Variables**, add:
   * `NEXT_PUBLIC_API_URL` = `https://capi-backend-xxxx.onrender.com` (Your Render URL from Step A).
4. Click **Deploy**. Your Vegas Detective dashboard is now live globally!

---

## 🔑 Environment Variable Configuration Matrix

| Variable Name | Required? | Default Value | Description |
| :--- | :---: | :--- | :--- |
| **`GROQ_API_KEY`** | **YES** | `gsk_...` | Powering Groq / Llama-3.3-70b AI reasoning for provenance synthesis and risk analysis. |
| **`COGNEE_MODE`** | OPTIONAL | `open_source` | Set to `open_source` for local FastEmbed+SQLite, or `cloud` to connect to Cognee Cloud API. |
| **`COGNEE_API_KEY`** | CLOUD ONLY | `faf55b...` | Required only when `COGNEE_MODE=cloud`. Authenticates with tenant vector storage. |
| **`GITHUB_TOKEN`** | OPTIONAL | `ghp_...` | Used by `PyGithub` during `./capi ingest-prs` to fetch pull request review discussions without rate limits. |
| **`NEXT_PUBLIC_API_URL`**| FRONTEND | `http://localhost:8001`| The public HTTP URL of your deployed FastAPI Cognee backend service. |

---

## 🛡️ Distributing the CLI & Guardrail to Developers

To let engineers in your organization audit codebases without cloning Capi:
1. **Via Pip**:
   ```bash
   pip install git+https://github.com/Akarshkushwaha/Capi.git
   capi install-hook
   ```
2. **Via Pre-Commit Framework (`.pre-commit-config.yaml`)**:
   ```yaml
   repos:
     - repo: https://github.com/Akarshkushwaha/Capi
       rev: main
       hooks:
         - id: capi-guardrail
   ```
   Run `pre-commit install`. Git will automatically run Capi whenever an engineer attempts to commit changes to `.env` or configuration files.
