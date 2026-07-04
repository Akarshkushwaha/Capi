"use client";

import React, { useState } from "react";
import { Rocket, Server, Cloud, Copy, Check, Terminal, ExternalLink, ShieldCheck, Cpu, Database, ArrowRight, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DeployPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deployTab, setDeployTab] = useState<"docker" | "render" | "vercel" | "aws">("docker");
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("online");

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const checkHealth = async () => {
    setApiStatus("checking");
    try {
      const res = await fetch("http://localhost:8001/health");
      if (res.ok) setApiStatus("online");
      else setApiStatus("offline");
    } catch {
      setApiStatus("offline");
    }
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-400 pb-12">
      {/* HEADER */}
      <div className="text-center space-y-4 pt-4 border-b border-[#2a2a2a] pb-8">
        <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/40 px-3 py-1 rounded-full text-[#22c55e] font-mono text-xs uppercase tracking-widest">
          <Rocket className="w-3.5 h-3.5 animate-bounce" />
          // PRODUCTION DEPLOYMENT MISSION CONTROL
        </div>
        <h1 className="font-bebas text-5xl md:text-[64px] text-white tracking-wide leading-none">
          DEPLOY CAPI TO THE CLOUD OR SELF-HOST
        </h1>
        <p className="font-sans text-lg md:text-xl text-[#9ca3af] max-w-3xl mx-auto">
          Capi is architected as a cloud-native, docker-ready full-stack suite. Whether deploying to Vercel & Render for free or self-hosting via Docker Compose on AWS/VPS, here are the exact production blueprints.
        </p>

        {/* LIVE HEALTH CHECK BADGE */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-2 bg-[#111111] border border-[#2a2a2a] px-4 py-2 rounded-lg font-mono text-xs">
            <span className="text-[#9ca3af]">LOCAL API HEALTH:</span>
            {apiStatus === "checking" && <span className="text-[#f5a623] animate-pulse">CHECKING...</span>}
            {apiStatus === "online" && (
              <span className="text-[#22c55e] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                ONLINE (HTTP 200 OK)
              </span>
            )}
            {apiStatus === "offline" && <span className="text-[#dc2626] font-bold">OFFLINE (PORT 8001)</span>}
            <button
              type="button"
              onClick={checkHealth}
              className="ml-2 text-[#9ca3af] hover:text-[#f5a623] transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${apiStatus === "checking" ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: DEPLOYMENT PLATFORM SELECTOR */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-[#22c55e]" />
        
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[#2a2a2a] pb-4">
          <div>
            <span className="font-mono text-xs text-[#22c55e] uppercase tracking-wider font-bold">
              // BLUEPRINT SELECTOR: 4 ENTERPRISE DEPLOYMENT CHANNELS
            </span>
            <h2 className="font-bebas text-4xl text-white tracking-wide mt-1">
              SELECT YOUR INFRASTRUCTURE TARGET
            </h2>
          </div>
          <span className="font-mono text-xs bg-[#1a1a1a] px-3 py-1 rounded text-[#9ca3af] border border-[#2a2a2a]">
            CONTAINER & CLOUD READY
          </span>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 border-b border-[#2a2a2a] pb-3">
          <button
            type="button"
            onClick={() => setDeployTab("docker")}
            className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              deployTab === "docker"
                ? "bg-[#22c55e] text-[#0a0a0a] shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                : "bg-[#1a1a1a] text-[#9ca3af] hover:text-white"
            }`}
          >
            <Server className="w-4 h-4" />
            1. Docker Compose (All-in-One VPS)
          </button>
          <button
            type="button"
            onClick={() => setDeployTab("render")}
            className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              deployTab === "render"
                ? "bg-[#f5a623] text-[#0a0a0a] shadow-[0_0_15px_rgba(245,166,35,0.3)]"
                : "bg-[#1a1a1a] text-[#9ca3af] hover:text-white"
            }`}
          >
            <Cloud className="w-4 h-4" />
            2. Render.com (1-Click Cloud Backend)
          </button>
          <button
            type="button"
            onClick={() => setDeployTab("vercel")}
            className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              deployTab === "vercel"
                ? "bg-white text-[#0a0a0a] shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                : "bg-[#1a1a1a] text-[#9ca3af] hover:text-white"
            }`}
          >
            <Rocket className="w-4 h-4" />
            3. Vercel (Next.js Dashboard)
          </button>
          <button
            type="button"
            onClick={() => setDeployTab("aws")}
            className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              deployTab === "aws"
                ? "bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-[#1a1a1a] text-[#9ca3af] hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4" />
            4. AWS / EC2 / DigitalOcean
          </button>
        </div>

        {/* TAB 1: DOCKER COMPOSE */}
        {deployTab === "docker" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="font-sans text-sm text-[#f5f5f0]/90">
              The recommended approach for enterprise self-hosting or VPS deployments. Our `docker-compose.yml` spins up both the FastAPI Cognee backend and Next.js frontend with persistent SQLite volume storage (`cognee_storage:/app/.cognee_data`).
            </p>
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 font-mono text-sm relative">
              <div className="flex items-center justify-between text-[#9ca3af] text-xs mb-2 pb-2 border-b border-[#1a1a1a]">
                <span>bash — terminal on any VPS / local server</span>
                <button
                  type="button"
                  onClick={() => copyText(`git clone https://github.com/Akarshkushwaha/Capi.git\ncd Capi\n# Set your Groq LLM key\nexport GROQ_API_KEY=gsk_your_key_here\n\n# Launch full-stack suite in detached mode\ndocker compose up -d --build`, "docker_cmd")}
                  className="flex items-center gap-1.5 text-[#22c55e] hover:text-white transition-colors"
                >
                  {copiedId === "docker_cmd" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "docker_cmd" ? "COPIED!" : "COPY COMMANDS"}</span>
                </button>
              </div>
              <div className="space-y-1 text-[#22c55e]">
                <p><span className="text-[#9ca3af]">$</span> git clone https://github.com/Akarshkushwaha/Capi.git && cd Capi</p>
                <p><span className="text-[#9ca3af]">$</span> export GROQ_API_KEY="gsk_rWruvdftYXGzgH0nPmPnWGdyb3..."</p>
                <p><span className="text-[#9ca3af]">$</span> docker compose up -d --build</p>
                <p className="text-[#f5f5f0] pt-2 opacity-80">✓ Backend live at http://localhost:8001 | Dashboard live at http://localhost:3000</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RENDER.COM */}
        {deployTab === "render" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="font-sans text-sm text-[#f5f5f0]/90">
              Deploy the FastAPI Cognee backend cleanly to Render. We have included an official **`render.yaml` Blueprint** file in the root directory that automatically configures persistent disk mounts (`cognee-data`) and healthchecks.
            </p>
            <div className="bg-[#1a1a1a]/60 border border-[#2a2a2a] rounded-lg p-5 space-y-3 font-sans text-sm">
              <div className="font-bebas text-2xl text-[#f5a623] flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                1-CLICK RENDER BLUEPRINT INSTRUCTIONS
              </div>
              <ol className="list-decimal list-inside space-y-2 text-[#f5f5f0] pl-2 font-mono text-xs">
                <li>Log in to your Render dashboard and click **New &gt; Blueprint**.</li>
                <li>Connect your GitHub repository: `https://github.com/Akarshkushwaha/Capi`.</li>
                <li>Render will auto-detect **`render.yaml`** and provision both `capi-backend` and `capi-dashboard`.</li>
                <li>In the Render environment settings, enter your **`GROQ_API_KEY`** (and optional `COGNEE_API_KEY` if using Cloud mode).</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 3: VERCEL */}
        {deployTab === "vercel" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="font-sans text-sm text-[#f5f5f0]/90">
              Deploy the Vegas Detective frontend dashboard to Vercel in seconds. Our **`dashboard/vercel.json`** ensures zero zero-config build compatibility with Next.js 14.
            </p>
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 font-mono text-sm relative">
              <div className="flex items-center justify-between text-[#9ca3af] text-xs mb-2 pb-2 border-b border-[#1a1a1a]">
                <span>bash — using Vercel CLI or Git import</span>
                <button
                  type="button"
                  onClick={() => copyText(`cd dashboard\n# Deploy via Vercel CLI\nnpx vercel --prod\n\n# Set production backend API environment variable\nnpx vercel env add NEXT_PUBLIC_API_URL production`, "vercel_cmd")}
                  className="flex items-center gap-1.5 text-white hover:text-[#f5a623] transition-colors"
                >
                  {copiedId === "vercel_cmd" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "vercel_cmd" ? "COPIED!" : "COPY COMMANDS"}</span>
                </button>
              </div>
              <div className="space-y-1 text-white">
                <p><span className="text-[#9ca3af]">$</span> cd dashboard</p>
                <p><span className="text-[#9ca3af]">$</span> npx vercel --prod</p>
                <p className="text-[#9ca3af] text-xs pt-2"># Set the URL of your deployed Render/VPS backend:</p>
                <p><span className="text-[#9ca3af]">$</span> npx vercel env add NEXT_PUBLIC_API_URL production</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AWS / EC2 */}
        {deployTab === "aws" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="font-sans text-sm text-[#f5f5f0]/90">
              When deploying to standard Ubuntu LTS instances on AWS EC2, Google Cloud Compute Engine, or DigitalOcean Droplets, use our automated setup script to configure firewall ports and Docker Compose:
            </p>
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 font-mono text-sm relative">
              <div className="flex items-center justify-between text-[#9ca3af] text-xs mb-2 pb-2 border-b border-[#1a1a1a]">
                <span>bash — EC2 Ubuntu user-data / SSH terminal</span>
                <button
                  type="button"
                  onClick={() => copyText(`sudo apt update && sudo apt install -y docker.io docker-compose-v2 git\ngit clone https://github.com/Akarshkushwaha/Capi.git && cd Capi\n\n# Create persistent .env file\necho "GROQ_API_KEY=gsk_your_key" > .env\necho "COGNEE_MODE=open_source" >> .env\n\nsudo docker compose up -d`, "aws_cmd")}
                  className="flex items-center gap-1.5 text-[#3b82f6] hover:text-white transition-colors"
                >
                  {copiedId === "aws_cmd" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "aws_cmd" ? "COPIED!" : "COPY SETUP SCRIPT"}</span>
                </button>
              </div>
              <div className="space-y-1 text-[#60a5fa] text-xs">
                <p><span className="text-[#9ca3af]">$</span> sudo apt update && sudo apt install -y docker.io docker-compose-v2 git</p>
                <p><span className="text-[#9ca3af]">$</span> git clone https://github.com/Akarshkushwaha/Capi.git && cd Capi</p>
                <p><span className="text-[#9ca3af]">$</span> echo "GROQ_API_KEY=gsk_..." &gt; .env</p>
                <p><span className="text-[#9ca3af]">$</span> sudo docker compose up -d</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: ENVIRONMENT VARIABLE MATRIX */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#2a2a2a] bg-[#14141a]/40 flex items-center justify-between">
          <h2 className="font-bebas text-3xl text-[#f5a623] tracking-wide">
            ENVIRONMENT VARIABLE CONFIGURATION MATRIX
          </h2>
          <span className="font-mono text-xs text-[#9ca3af]">
            SOURCE OF TRUTH: `.env`
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#f5a623] text-[#f5a623] bg-[#0a0a0a]">
                <th className="py-3.5 px-6 font-semibold">VARIABLE NAME</th>
                <th className="py-3.5 px-6 font-semibold w-32">STATUS</th>
                <th className="py-3.5 px-6 font-semibold">DEFAULT VALUE</th>
                <th className="py-3.5 px-6 font-semibold">DESCRIPTION & ARCHITECTURE USE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a] text-[#f5f5f0]">
              <tr className="bg-[#111111]">
                <td className="py-3.5 px-6 font-bold text-[#f5a623]">GROQ_API_KEY</td>
                <td className="py-3.5 px-6"><span className="px-2 py-0.5 rounded bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/40">REQUIRED</span></td>
                <td className="py-3.5 px-6 text-[#9ca3af]">gsk_...</td>
                <td className="py-3.5 px-6 font-sans">Powering Groq / Llama-3.3-70b AI reasoning for provenance synthesis and risk analysis.</td>
              </tr>
              <tr className="bg-[#0f0f0f]">
                <td className="py-3.5 px-6 font-bold text-[#22c55e]">COGNEE_MODE</td>
                <td className="py-3.5 px-6"><span className="px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40">OPTIONAL</span></td>
                <td className="py-3.5 px-6 text-[#9ca3af]">open_source</td>
                <td className="py-3.5 px-6 font-sans">Set to `open_source` for local FastEmbed+SQLite, or `cloud` to connect to Cognee Cloud API.</td>
              </tr>
              <tr className="bg-[#111111]">
                <td className="py-3.5 px-6 font-bold text-[#60a5fa]">COGNEE_API_KEY</td>
                <td className="py-3.5 px-6"><span className="px-2 py-0.5 rounded bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40">CLOUD ONLY</span></td>
                <td className="py-3.5 px-6 text-[#9ca3af]">faf55b...</td>
                <td className="py-3.5 px-6 font-sans">Required only when `COGNEE_MODE=cloud`. Authenticates with tenant vector storage.</td>
              </tr>
              <tr className="bg-[#0f0f0f]">
                <td className="py-3.5 px-6 font-bold text-[#f5f5f0]">GITHUB_TOKEN</td>
                <td className="py-3.5 px-6"><span className="px-2 py-0.5 rounded bg-[#9ca3af]/20 text-[#9ca3af] border border-[#9ca3af]/40">OPTIONAL</span></td>
                <td className="py-3.5 px-6 text-[#9ca3af]">ghp_...</td>
                <td className="py-3.5 px-6 font-sans">Used by `PyGithub` during `./capi ingest-prs` to fetch pull request review discussions without rate limits.</td>
              </tr>
              <tr className="bg-[#111111]">
                <td className="py-3.5 px-6 font-bold text-[#f5f5f0]">NEXT_PUBLIC_API_URL</td>
                <td className="py-3.5 px-6"><span className="px-2 py-0.5 rounded bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/40">FRONTEND</span></td>
                <td className="py-3.5 px-6 text-[#9ca3af]">http://localhost:8001</td>
                <td className="py-3.5 px-6 font-sans">The public HTTP URL of your deployed FastAPI Cognee backend service.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER CALL TO ACTION */}
      <div className="bg-[#14141a] border border-[#22c55e]/40 rounded-xl p-8 text-center space-y-4 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
        <h3 className="font-bebas text-4xl text-white tracking-wide">
          INFRASTRUCTURE READY TO LAUNCH
        </h3>
        <p className="font-sans text-base text-[#9ca3af] max-w-xl mx-auto">
          Every container, volume mount, and cloud blueprint is configured and tested.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/onboarding"
            className="px-8 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-[#0a0a0a] font-bebas text-2xl tracking-wider rounded-lg transition-transform hover:-translate-y-0.5 shadow-lg flex items-center gap-2"
          >
            <span>VIEW WORKFLOW INDUCTION</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="px-8 py-3 bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#f5a623] text-[#f5f5f0] font-bebas text-2xl tracking-wider rounded-lg transition-colors"
          >
            RETURN TO MISSION CONTROL
          </Link>
        </div>
      </div>
    </div>
  );
}
