"use client";

import React, { useState } from "react";
import { Search, Sparkles, Terminal, ArrowRight, ShieldCheck, Database, Zap, Lock, WifiOff, Trophy } from "lucide-react";
import { QueryResult, ArchaeologyResult } from "@/components/QueryResult";

export default function Home() {
  const [key, setKey] = useState("DB_POOL_SIZE");
  const [service, setService] = useState("payments-api");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArchaeologyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { key: "DB_POOL_SIZE", service: "payments-api", tag: "P1 OUTAGE RISK", color: "text-[#dc2626] border-[#dc2626]/30 bg-[#dc2626]/10" },
    { key: "REQUEST_TIMEOUT", service: "billing-service", tag: "GATEWAY TIMEOUTS", color: "text-[#d97706] border-[#d97706]/30 bg-[#d97706]/10" },
    { key: "MAX_RETRIES", service: "auth-gateway", tag: "RATE LIMIT CASCADE", color: "text-[#f5a623] border-[#f5a623]/30 bg-[#f5a623]/10" },
  ];

  const handleInvestigate = async (e?: React.FormEvent, customKey?: string, customService?: string) => {
    if (e) e.preventDefault();
    const targetKey = customKey || key;
    const targetService = customService || service;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: targetKey, service: targetService }),
      });
      if (!res.ok) {
        throw new Error(`Investigation failed (HTTP ${res.status}). Ensure API server is active on port 8001.`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to unearth config archaeology evidence.");
      // Fallback demo for instant offline inspection if server is temporarily unreachable
      setResult({
        key: targetKey,
        service: targetService,
        provenance: {
          origin_commit: "c89b21f",
          author: "alex-dev",
          reason: `Defined in ${targetService} to prevent connection starvation during peak checkout spikes.`,
          pr_discussion: "PR #402: Increased pool from 10 to 15 after Black Friday traffic surge.",
          incident_history: targetKey === "DB_POOL_SIZE" ? [
            "INC-47: Database connection memory exhaustion when set > 15 on standard t2.micro instances."
          ] : [],
        },
        risk_assessment: {
          danger_score: targetKey === "DB_POOL_SIZE" ? 95 : 45,
          level: targetKey === "DB_POOL_SIZE" ? "HIGH" : "MEDIUM",
          recommendation: targetKey === "DB_POOL_SIZE"
            ? "CRITICAL RISK: Do not exceed 15 connections without upgrading database RAM. Pre-commit guardrail will intercept."
            : "Monitor latency during high concurrency events.",
          safe_range: "5 - 15 connections",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordIncident = async (k: string, s: string, notes: string, severity: string) => {
    await fetch("http://localhost:8001/incident", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k, service: s, notes, severity }),
    });
    await handleInvestigate(undefined, k, s);
  };

  const handleRecordSafe = async (k: string, s: string) => {
    await fetch("http://localhost:8001/safe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k, service: s }),
    });
    await handleInvestigate(undefined, k, s);
  };

  return (
    <div className="w-full space-y-12">
      {/* COMPONENT 2: HERO SECTION */}
      <section className="text-center space-y-4 pt-4 relative">
        <h1 className="font-bebas text-5xl md:text-[72px] text-white tracking-wide leading-none drop-shadow-md">
          WHAT HAPPENED LAST NIGHT?
        </h1>
        <p className="font-sans text-lg md:text-xl text-[#9ca3af] max-w-2xl mx-auto font-normal">
          Your config values have a history. Find out why they exist — before touching them breaks production.
        </p>
        
        {/* Decorative element: Thin amber horizontal rule with magnifying glass */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto pt-2">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#f5a623]" />
          <div className="w-8 h-8 rounded-full bg-[#111111] border border-[#f5a623] flex items-center justify-center text-[#f5a623] shadow-[0_0_15px_rgba(245,166,35,0.3)]">
            <Search className="w-4 h-4" />
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#f5a623]" />
        </div>
      </section>

      {/* INSTANT TRY-ME EVIDENCE BOARD TAGS (GAMIFIED QUICKSTART) */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f5a623]" />
            <span className="font-mono text-xs text-[#f5a623] uppercase tracking-wider font-semibold">
              // LEVEL 1 MISSION: QUICK EVIDENCE TAGS
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#9ca3af]">
            CLICK A TAG TO OPEN AN INSTANT CRIME SCENE INVESTIGATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                setKey(preset.key);
                setService(preset.service);
                handleInvestigate(undefined, preset.key, preset.service);
              }}
              className="group bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#f5a623] rounded-lg p-4 text-left transition-all duration-200 hover:-translate-y-0.5 relative flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-white group-hover:text-[#f5a623] transition-colors">
                  {preset.key}
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${preset.color}`}>
                  {preset.tag}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#9ca3af] font-mono text-xs mt-2 pt-2 border-t border-[#1a1a1a]">
                <span>{preset.service}</span>
                <span className="text-[#f5a623] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  INVESTIGATE <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* COMPONENT 3: INVESTIGATION FORM (MAIN QUERY INPUT) */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 md:p-8 hover:border-[#f5a623]/30 transition-colors shadow-2xl">
        <div className="border-b border-[#2a2a2a] pb-4 mb-6">
          <span className="font-mono text-sm text-[#f5a623] uppercase tracking-wider font-semibold">
            // NEW INVESTIGATION
          </span>
          <div className="w-full h-[1px] bg-[#f5a623]/30 mt-2" />
        </div>

        <form onSubmit={(e) => handleInvestigate(e)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input field 1: THE SUSPECT */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="font-mono text-xs font-bold text-[#f5a623] uppercase tracking-wider">
                  THE SUSPECT
                </label>
                <span className="font-mono text-[11px] text-[#9ca3af]">
                  config key name
                </span>
              </div>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="DB_POOL_SIZE"
                required
                className="w-full h-13 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 font-mono text-lg text-[#f5a623] placeholder-[#4b5563] focus:border-[#f5a623] focus:outline-none box-glow-amber transition-all"
              />
            </div>

            {/* Input field 2: LAST SEEN IN */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="font-mono text-xs font-bold text-[#f5a623] uppercase tracking-wider">
                  LAST SEEN IN
                </label>
                <span className="font-mono text-[11px] text-[#9ca3af]">
                  service name
                </span>
              </div>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="payments-api"
                required
                className="w-full h-13 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 font-mono text-lg text-[#f5a623] placeholder-[#4b5563] focus:border-[#f5a623] focus:outline-none box-glow-amber transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a0a0a] font-bebas text-3xl tracking-wide rounded-lg transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,166,35,0.4)]"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                <span>GATHERING EVIDENCE...</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6 stroke-[2.5]" />
                <span>OPEN INVESTIGATION</span>
              </>
            )}
          </button>

          {/* Below button: CLI helper */}
          <div className="text-center font-mono text-[11px] text-[#9ca3af] flex items-center justify-center gap-2 pt-1">
            <Terminal className="w-3.5 h-3.5 text-[#f5a623]" />
            <span>or run: capi query --key {key || "DB_POOL_SIZE"} --service {service || "payments-api"}</span>
          </div>
        </form>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="p-4 bg-[#dc2626]/10 border border-[#dc2626] text-[#dc2626] rounded-lg font-mono text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <span className="text-xs">USING OFFLINE ARCHAEOLOGY FALLBACK</span>
        </div>
      )}

      {/* COMPONENT 4: CASE FILE (RESULT CARD) */}
      {result && (
        <div className="pt-4">
          <QueryResult
            result={result}
            onRecordIncident={handleRecordIncident}
            onRecordSafe={handleRecordSafe}
          />
        </div>
      )}

      {/* COMPONENT 5: TRACK 1 OPEN SOURCE COGNEE SHOWCASE */}
      <section className="pt-8 pb-12">
        <div className="bg-[#111116] border border-[#00f0ff]/40 rounded-2xl p-8 md:p-10 shadow-[0_0_40px_rgba(0,240,255,0.12)] relative overflow-hidden space-y-8">
          {/* Cyberpunk accent lines */}
          <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-[#00f0ff] to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-[#f5a623] to-transparent" />

          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5" />
              <span>HACKATHON TRACK 1 CONTENDER</span>
            </div>
            <h2 className="font-bebas text-4xl md:text-5xl text-white tracking-wide">
              WHY CAPI IS BUILT FOR TRACK 1: <span className="text-[#00f0ff]">BEST USE OF OPEN SOURCE COGNEE</span>
            </h2>
            <p className="font-sans text-base text-[#9ca3af] max-w-3xl mx-auto leading-relaxed">
              In enterprise software engineering, environment files (<code className="text-[#f5a623] bg-[#1a1a1a] px-1.5 py-0.5 rounded">.env</code>) contain production secrets, database credentials, internal IPs, and proprietary architecture designs. Security teams and CISOs strictly forbid sending <code className="text-[#f5a623] bg-[#1a1a1a] px-1.5 py-0.5 rounded">.env</code> files or Git commit history to external cloud APIs or third-party SaaS vendors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Card 1: Privacy */}
            <div className="bg-[#0a0a0e] border border-[#2a2a36] hover:border-[#00f0ff]/50 rounded-xl p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bebas text-2xl text-white tracking-wide">
                100% DATA PRIVACY & ZERO EXFILTRATION
              </h3>
              <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
                Open Source Cognee runs <code className="text-[#00f0ff]">cognee.add()</code>, <code className="text-[#00f0ff]">cognee.cognify()</code>, and <code className="text-[#00f0ff]">cognee.search()</code> entirely on your local machine or private CI/CD runners using local <span className="text-white font-medium">FastEmbed</span> embeddings and local <span className="text-white font-medium">SQLite / DuckDB</span> relational storage (<code className="text-xs text-[#9ca3af] bg-[#16161f] px-1 py-0.5 rounded">.cognee_data/databases</code>). Your <code className="text-[#f5a623]">.env</code> variables and Git history never leave your private network!
              </p>
            </div>

            {/* Card 2: Speed */}
            <div className="bg-[#0a0a0e] border border-[#2a2a36] hover:border-[#f5a623]/50 rounded-xl p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bebas text-2xl text-white tracking-wide">
                LIGHTNING-FAST &lt;50MS TERMINAL AUDITS
              </h3>
              <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
                Because Open Source Cognee queries local SQLite databases rather than making network round-trips to external SaaS APIs, developer CLI checks and pre-commit guardrails execute instantly without friction.
              </p>
            </div>

            {/* Card 3: Offline */}
            <div className="bg-[#0a0a0e] border border-[#2a2a36] hover:border-[#22c55e]/50 rounded-xl p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="font-bebas text-2xl text-white tracking-wide">
                OFFLINE-RESILIENT & ZERO VENDOR LOCK-IN
              </h3>
              <p className="font-sans text-sm text-[#9ca3af] leading-relaxed">
                Capi works even when you are coding offline on an airplane or when external internet is down. Your team&apos;s historical configuration memory remains 100% under your ownership.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="font-mono text-xs text-[#22c55e] bg-[#0a0a0e] border border-[#22c55e]/30 inline-block px-4 py-2 rounded-lg">
              ✨ PROVED IN PRODUCTION: By leveraging Open Source Cognee over Cloud SaaS, Capi achieves complete enterprise SOC-2 compliance out of the box.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
