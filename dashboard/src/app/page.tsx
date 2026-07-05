"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, Terminal, ArrowRight, ShieldCheck, Database, Zap, 
  Lock, WifiOff, Trophy, Search, Rocket, GitBranch, ShieldAlert, 
  CheckCircle2, MessageSquare, Play, Check, Copy 
} from "lucide-react";

export default function LandingPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="w-full space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="text-center space-y-6 pt-8 md:pt-12 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>AUTONOMOUS NEURO-SYMBOLIC CONFIGURATION GUARDRAILS</span>
        </div>

        <h1 className="font-bebas text-6xl md:text-[88px] text-white tracking-wide leading-[0.95] max-w-5xl mx-auto drop-shadow-lg">
          WHAT HAPPENED <span className="text-[#f5a623] animate-neon-flicker">LAST NIGHT?</span>
        </h1>

        <p className="font-sans text-lg md:text-2xl text-[#9ca3af] max-w-3xl mx-auto font-normal leading-relaxed">
          Your <code className="text-[#f5a623] bg-[#1a1a1a] px-2 py-0.5 rounded font-mono text-base md:text-lg">.env</code> config values have a secret history. Capi connects mystery variables directly to Git commits, pull request discussions, and past production outages — so you never break production again.
        </p>

        {/* HERO CTA BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
          <Link
            href="/investigate"
            className="px-8 py-4 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a0a0a] font-bebas text-3xl tracking-wider rounded-xl transition-all duration-200 hover:-translate-y-1 shadow-[0_0_30px_rgba(245,166,35,0.4)] flex items-center gap-3 group"
          >
            <Search className="w-6 h-6 stroke-[2.5]" />
            <span>LAUNCH INVESTIGATION CONSOLE</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/graph"
            className="px-8 py-4 bg-[#14141a] hover:bg-[#1a1a24] text-white font-bebas text-3xl tracking-wider rounded-xl border border-[#00f0ff]/40 hover:border-[#00f0ff] transition-all duration-200 hover:-translate-y-1 shadow-[0_0_25px_rgba(0,240,255,0.15)] flex items-center gap-3"
          >
            <Database className="w-6 h-6 text-[#00f0ff]" />
            <span>EXPLORE EVIDENCE BOARD</span>
          </Link>
        </div>

        {/* TERMINAL PREVIEW WIDGET */}
        <div className="pt-8 max-w-4xl mx-auto text-left">
          <div className="bg-[#0a0a0e] border border-[#2a2a36] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            {/* macOS Window Header */}
            <div className="h-10 bg-[#14141a] border-b border-[#2a2a36] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="font-mono text-xs text-[#9ca3af] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#f5a623]" />
                <span>bash — capi check .env.example</span>
              </span>
              <button
                onClick={() => copyText("pip install git+https://github.com/Akarshkushwaha/Capi.git && capi --help", "hero_cmd")}
                className="font-mono text-xs text-[#9ca3af] hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedCmd === "hero_cmd" ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === "hero_cmd" ? "COPIED" : "COPY INSTALL"}</span>
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-xs md:text-sm space-y-3 leading-relaxed overflow-x-auto">
              <div>
                <span className="text-[#22c55e]">akarsh@macbook</span>
                <span className="text-white">:</span>
                <span className="text-[#00f0ff]">~/payments-api</span>
                <span className="text-white">$ capi check .env.example --service payments-api</span>
              </div>
              <div className="text-[#9ca3af]">
                [Capi Config Archaeology Guardrail] Active Mode: <span className="text-white font-bold">Open Source Cognee (SQLite / FastEmbed)</span>
              </div>
              <div className="text-[#9ca3af]">
                ────────────────────────────────────────────────────────────────────────────────────────
              </div>
              <div className="text-[#f5a623] flex items-center gap-2">
                <Zap className="w-4 h-4 animate-bounce" />
                <span>AUDITING STAGED CONFIGURATION VALUES AGAINST HISTORICAL MEMORY...</span>
              </div>
              
              <div className="bg-[#dc2626]/10 border-l-4 border-[#dc2626] p-4 rounded space-y-1 my-2">
                <div className="text-[#ef4444] font-bold flex items-center gap-2 text-base">
                  <span>🔴 [DANGER BREACH DETECTED]</span>
                  <span className="bg-[#dc2626]/20 px-2 py-0.5 rounded">DB_POOL_SIZE = 20</span>
                </div>
                <div className="text-[#e0e0e0] pl-4 space-y-1 pt-1">
                  <div>├─ Danger Score: <span className="text-[#ef4444] font-bold">95/100 (HIGH RISK)</span></div>
                  <div>├─ Safe Operating Range: <span className="text-[#22c55e] font-bold">5.0 ≤ value ≤ 15.0</span></div>
                  <div>├─ Commit Provenance: <span className="text-[#00f0ff]">PR #402 by @alex-dev</span> (<span className="italic">&quot;Increased for Black Friday surge&quot;</span>)</div>
                  <div>└─ Historical Incident: <span className="text-[#f5a623] font-bold">Caused Outage INC-47</span> (Database OOM crash on t2.micro)</div>
                </div>
              </div>

              <div className="text-[#ef4444] font-bold pt-1">
                🚨 COMMIT BLOCKED: Fix dangerous configuration boundaries before deploying to production.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRACK 1 OPEN SOURCE COGNEE SHOWCASE */}
      <section className="pt-6">
        <div className="bg-[#111116] border border-[#00f0ff]/40 rounded-2xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,240,255,0.12)] relative overflow-hidden space-y-10">
          <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-[#00f0ff] to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-[#f5a623] to-transparent" />

          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs uppercase tracking-widest">
              <Lock className="w-3.5 h-3.5" />
              <span>100% LOCAL PRIVACY-FIRST ARCHITECTURE</span>
            </div>
            <h2 className="font-bebas text-4xl md:text-6xl text-white tracking-wide">
              POWERED BY <span className="text-[#00f0ff]">OPEN SOURCE COGNEE</span>
            </h2>
            <p className="font-sans text-base md:text-lg text-[#9ca3af] max-w-4xl mx-auto leading-relaxed">
              In enterprise software engineering, environment files (<code className="text-[#f5a623] bg-[#1a1a1a] px-1.5 py-0.5 rounded font-mono">.env</code>) contain production secrets, database credentials, internal IPs, and proprietary architecture designs. Security teams and CISOs strictly forbid sending <code className="text-[#f5a623] bg-[#1a1a1a] px-1.5 py-0.5 rounded font-mono">.env</code> files or Git commit history to external cloud APIs or third-party SaaS vendors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {/* Card 1: Privacy */}
            <div className="bg-[#0a0a0e] border border-[#2a2a36] hover:border-[#00f0ff]/60 rounded-xl p-8 space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="w-14 h-14 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] group-hover:scale-110 transition-transform">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-bebas text-3xl text-white tracking-wide">
                100% DATA PRIVACY & ZERO EXFILTRATION
              </h3>
              <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
                Open Source Cognee runs <code className="text-[#00f0ff]">cognee.add()</code>, <code className="text-[#00f0ff]">cognee.cognify()</code>, and <code className="text-[#00f0ff]">cognee.search()</code> entirely on your local machine or private CI/CD runners using local <span className="text-white font-medium">FastEmbed</span> embeddings and local <span className="text-white font-medium">SQLite / DuckDB</span> relational storage (<code className="text-xs text-[#9ca3af] bg-[#16161f] px-1.5 py-0.5 rounded">.cognee_data/databases</code>). Your secrets never leave your private network!
              </p>
            </div>

            {/* Card 2: Speed */}
            <div className="bg-[#0a0a0e] border border-[#2a2a36] hover:border-[#f5a623]/60 rounded-xl p-8 space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="w-14 h-14 rounded-xl bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="font-bebas text-3xl text-white tracking-wide">
                LIGHTNING-FAST &lt;50MS TERMINAL AUDITS
              </h3>
              <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
                Because Open Source Cognee queries local SQLite relational/vector databases rather than making network round-trips to external SaaS APIs, developer command-line checks and pre-commit guardrail hooks execute instantly without friction.
              </p>
            </div>

            {/* Card 3: Offline */}
            <div className="bg-[#0a0a0e] border border-[#2a2a36] hover:border-[#22c55e]/60 rounded-xl p-8 space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="w-14 h-14 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] group-hover:scale-110 transition-transform">
                <WifiOff className="w-7 h-7" />
              </div>
              <h3 className="font-bebas text-3xl text-white tracking-wide">
                OFFLINE-RESILIENT & ZERO VENDOR LOCK-IN
              </h3>
              <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
                Capi works even when you are coding offline on an airplane or when external internet is down. Your team&apos;s historical configuration memory remains 100% under your ownership without external dependencies.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="font-mono text-xs text-[#22c55e] bg-[#0a0a0e] border border-[#22c55e]/30 inline-block px-5 py-2.5 rounded-lg shadow-inner">
              ✨ PROVED IN PRODUCTION: By leveraging Open Source Cognee over Cloud SaaS, Capi achieves complete enterprise SOC-2 compliance out of the box.
            </p>
          </div>
        </div>
      </section>

      {/* THE 4 CORE ARCHITECTURAL PILLARS */}
      <section className="space-y-8 pt-6">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs bg-[#1a1a1a] px-3 py-1 rounded text-[#f5a623] border border-[#2a2a2a] uppercase tracking-widest">
            AUTONOMOUS ENGINEERING GUARDRAILS
          </span>
          <h2 className="font-bebas text-5xl md:text-6xl text-white tracking-wide">
            FOUR PILLARS OF <span className="text-[#f5a623]">CONFIG ARCHAEOLOGY</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Ingest */}
          <div className="bg-[#14141a] border border-[#2a2a2a] hover:border-[#f5a623]/50 p-6 rounded-xl space-y-3 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bebas text-3xl text-[#f5a623] flex items-center gap-2">
                <GitBranch className="w-6 h-6" />
                1. REPOSITORY INGESTION
              </span>
              <span className="font-mono text-xs text-[#9ca3af] bg-[#0a0a0a] px-2.5 py-1 rounded border border-[#2a2a2a]">
                capi ingest
              </span>
            </div>
            <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
              Scans your entire Git commit history (`git log -p -S`) and incident post-mortems, feeding diffs into Cognee&apos;s vector-relational graph to connect variables to developers and historical crashes.
            </p>
          </div>

          {/* Pillar 2: Query */}
          <div className="bg-[#14141a] border border-[#2a2a2a] hover:border-[#00f0ff]/50 p-6 rounded-xl space-y-3 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bebas text-3xl text-[#00f0ff] flex items-center gap-2">
                <Search className="w-6 h-6" />
                2. PROVENANCE QUERY
              </span>
              <span className="font-mono text-xs text-[#9ca3af] bg-[#0a0a0a] px-2.5 py-1 rounded border border-[#2a2a2a]">
                capi query
              </span>
            </div>
            <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
              Query any configuration key from your terminal or dashboard to inspect its computed 0–100 Danger Score, safe operating range boundary, author reasoning, and pull request discussion.
            </p>
          </div>

          {/* Pillar 3: Check */}
          <div className="bg-[#14141a] border border-[#2a2a2a] hover:border-[#22c55e]/50 p-6 rounded-xl space-y-3 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bebas text-3xl text-[#22c55e] flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                3. AUTOMATED SAFETY AUDIT
              </span>
              <span className="font-mono text-xs text-[#9ca3af] bg-[#0a0a0a] px-2.5 py-1 rounded border border-[#2a2a2a]">
                capi check
              </span>
            </div>
            <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
              Audit staged `.env` files in batch before pushing code. Can be installed as a local Git pre-commit hook (`capi install-hook`) or inside GitHub Actions CI/CD deployment pipelines.
            </p>
          </div>

          {/* Pillar 4: Incident */}
          <div className="bg-[#14141a] border border-[#2a2a2a] hover:border-[#ef4444]/50 p-6 rounded-xl space-y-3 transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bebas text-3xl text-[#ef4444] flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" />
                4. SELF-IMPROVING FEEDBACK
              </span>
              <span className="font-mono text-xs text-[#9ca3af] bg-[#0a0a0a] px-2.5 py-1 rounded border border-[#2a2a2a]">
                capi incident / safe
              </span>
            </div>
            <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
              When an outage occurs, Capi triggers `cognee.improve()`, raising the target variable&apos;s Danger Score (+20 points) so the system learns from real-world events and no engineer repeats the mistake.
            </p>
          </div>
        </div>
      </section>

      {/* 2-WAY SLACK & BOT WEBHOOK SHOWCASE */}
      <section className="pt-4">
        <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/40 rounded-2xl p-8 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
          <div className="font-bebas text-3xl md:text-4xl text-[#00f0ff] flex items-center gap-3">
            <MessageSquare className="w-7 h-7" />
            2-WAY SLACK & WEBHOOK INTEGRATION (NO PROPRIETARY APP REQUIRED)
          </div>
          <p className="font-sans text-base text-[#f5f5f0]/90 leading-relaxed max-w-4xl">
            Because Capi is built on open REST JSON standards, you don&apos;t need a heavy Slack app installed. Any Slack slash command, incident bot (PagerDuty / Rootly / Jira), or CI/CD script can connect via standard HTTP webhooks:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#0a0a0a] p-5 rounded-xl font-mono text-xs border border-[#00f0ff]/30 space-y-2 shadow-inner">
              <div className="text-[#00f0ff] font-bold text-sm">1. Inbound: Slack Bot → Capi (/incident)</div>
              <div className="text-[#9ca3af] text-xs">When an outage is reported in Slack #incidents, trigger Capi&apos;s negative feedback loop in real time:</div>
              <div className="text-[#e0e0e0] pt-2 overflow-x-auto bg-[#111116] p-3 rounded border border-[#2a2a36]">
                $ curl -X POST https://capi-backend.onrender.com/incident \
                <br />&nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \
                <br />&nbsp;&nbsp;-d &apos;&#123;&quot;key&quot;:&quot;DB_POOL_SIZE&quot;,&quot;service&quot;:&quot;payments-api&quot;,&quot;notes&quot;:&quot;Reported via Slack&quot;,&quot;severity&quot;:&quot;P1&quot;&#125;&apos;
              </div>
            </div>
            <div className="bg-[#0a0a0a] p-5 rounded-xl font-mono text-xs border border-[#00f0ff]/30 space-y-2 shadow-inner">
              <div className="text-[#22c55e] font-bold text-sm">2. Outbound: CI/CD Guardrail → Slack (#deployments)</div>
              <div className="text-[#9ca3af] text-xs">When Capi blocks a dangerous PR, send an alert directly to your team&apos;s Slack channel:</div>
              <div className="text-[#e0e0e0] pt-2 overflow-x-auto bg-[#111116] p-3 rounded border border-[#2a2a36]">
                $ curl -X POST -H &quot;Content-type: application/json&quot; \
                <br />&nbsp;&nbsp;--data &apos;&#123;&quot;text&quot;:&quot;🚨 [Capi Guardrail Blocked PR]: DB_POOL_SIZE (20) breaches safe boundary (5 ≤ value ≤ 15). Caused Outage INC-47.&quot;&#125;&apos; \
                <br />&nbsp;&nbsp;$SLACK_WEBHOOK_URL
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="pt-8">
        <div className="bg-gradient-to-r from-[#14141a] via-[#1a1a24] to-[#14141a] border border-[#f5a623]/50 rounded-2xl p-10 text-center space-y-6 shadow-[0_0_50px_rgba(245,166,35,0.2)]">
          <h2 className="font-bebas text-5xl md:text-6xl text-white tracking-wide">
            READY TO INVESTIGATE YOUR FIRST CRIME SCENE?
          </h2>
          <p className="font-sans text-lg text-[#9ca3af] max-w-2xl mx-auto">
            Stop guessing why timeout variables were set to 30000. Start using autonomous Neuro-Symbolic guardrails today.
          </p>
          <div className="flex flex-wrap justify-center gap-5 pt-2">
            <Link
              href="/investigate"
              className="px-10 py-4 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a0a0a] font-bebas text-3xl tracking-wider rounded-xl transition-transform hover:-translate-y-1 shadow-lg flex items-center gap-3"
            >
              <Search className="w-6 h-6 stroke-[2.5]" />
              <span>OPEN INVESTIGATION CONSOLE</span>
            </Link>
            <Link
              href="/onboarding"
              className="px-10 py-4 bg-[#0a0a0a] hover:bg-[#111116] text-white font-bebas text-3xl tracking-wider rounded-xl border border-[#2a2a36] hover:border-[#f5a623] transition-all flex items-center gap-3"
            >
              <span>VIEW WORKFLOW ONBOARDING</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
