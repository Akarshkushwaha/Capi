"use client";

import React, { useState } from "react";
import Link from "next/link";
import QueryResult, { ArchaeologyResult } from "@/components/QueryResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Terminal, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  HelpCircle, 
  Network, 
  Upload, 
  Play, 
  Sparkles,
  Activity,
  Award,
  ChevronRight
} from "lucide-react";

export default function MissionControlPage() {
  const [service, setService] = useState<string>("payments-api");
  const [keyName, setKeyName] = useState<string>("DB_POOL_SIZE");
  const [activeTab, setActiveTab] = useState<string>("scan");
  
  // Incident Form State
  const [incKey, setIncKey] = useState<string>("DB_POOL_SIZE");
  const [incNotes, setIncNotes] = useState<string>("Outage [P1]: Downstream database timeout during traffic spike.");
  const [incSeverity, setIncSeverity] = useState<string>("P1");

  // Safe Form State
  const [safeKey, setSafeKey] = useState<string>("CACHE_TTL");

  // Env Audit State
  const [envContent, setEnvContent] = useState<string>("DB_POOL_SIZE=25\nREQUEST_TIMEOUT=20\nMAX_RETRIES=20\nCACHE_TTL=15\nWORKER_THREADS=15");
  const [auditResults, setAuditResults] = useState<any[] | null>(null);

  // Result & Loading State
  const [result, setResult] = useState<ArchaeologyResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

  // Trigger Query
  const runQuery = async (targetKey: string, targetService: string) => {
    setLoading(true);
    setResult(null);
    setFeedbackMsg(null);
    setAuditResults(null);
    try {
      const res = await fetch(`${apiUrl}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: targetKey.trim(), service: targetService.trim() }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message || "Failed to connect to Capi backend on port 8001." });
    } finally {
      setLoading(false);
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyName.trim() && service.trim()) {
      runQuery(keyName, service);
    }
  };

  const handleTryPreset = (presetKey: string) => {
    setKeyName(presetKey);
    setActiveTab("scan");
    runQuery(presetKey, service);
  };

  // Trigger Incident Report (Negative Feedback)
  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`${apiUrl}/incident`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: incKey.trim(), service: service.trim(), notes: incNotes, severity: incSeverity }),
      });
      if (!res.ok) throw new Error(`Failed to record incident: ${res.statusText}`);
      const data = await res.json();
      setFeedbackMsg(`🚨 ${data.message} (Danger Score +20 triggered in graph memory)`);
      // Re-run query to show updated score!
      runQuery(incKey, service);
    } catch (err: any) {
      setFeedbackMsg(`❌ Error: ${err.message}`);
      setLoading(false);
    }
  };

  // Trigger Safe Deployment Report (Positive Feedback)
  const handleSafeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`${apiUrl}/safe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: safeKey.trim(), service: service.trim() }),
      });
      if (!res.ok) throw new Error(`Failed to record safe deployment: ${res.statusText}`);
      const data = await res.json();
      setFeedbackMsg(`✅ ${data.message} (Danger Score -10 reduced in graph memory)`);
      // Re-run query to show updated score!
      runQuery(safeKey, service);
    } catch (err: any) {
      setFeedbackMsg(`❌ Error: ${err.message}`);
      setLoading(false);
    }
  };

  // Trigger Full Env File Audit
  const handleEnvAudit = async () => {
    setLoading(true);
    setResult(null);
    setFeedbackMsg(null);
    try {
      const lines = envContent.split("\n");
      const keys: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          keys.push(trimmed.split("=")[0].trim());
        }
      }

      if (keys.length === 0) {
        setFeedbackMsg("❌ No valid variable keys found in .env content.");
        setLoading(false);
        return;
      }

      const results: any[] = [];
      for (const k of keys) {
        try {
          const res = await fetch(`${apiUrl}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: k, service: service }),
          });
          if (res.ok) {
            const data = await res.json();
            results.push(data);
          }
        } catch (e) {
          // ignore individual failures
        }
      }
      setAuditResults(results);
    } catch (err: any) {
      setFeedbackMsg(`❌ Error during Env Audit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Cyber Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] neon-glow-cyan animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#00f0ff] uppercase tracking-widest">
              <Badge className="bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 font-bold">COGNEE MODE: OPEN_SOURCE</Badge>
              <span>•</span>
              <span className="text-slate-400">SELF-IMPROVING MEMORY LAYER</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-mono text-white mt-1">
              CAPI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-slate-200 to-[#ff003c]">MISSION CONTROL</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/graph">
            <Button className="bg-gradient-to-r from-[#00f0ff] to-[#0088ff] hover:opacity-90 text-black font-mono text-xs font-black uppercase tracking-wider px-5 py-5 rounded-xl shadow-lg shadow-[#00f0ff]/20 flex items-center gap-2">
              <Network className="w-4 h-4" /> View Force Graph <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* GAMIFIED LEVEL 1 ONBOARDING MISSION BANNER */}
      <Card className="glass-panel border-[#00f0ff]/40 neon-glow-cyan text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#ffaa00] to-[#ff003c]" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-[#ffaa00]" />
              <CardTitle className="text-xl font-mono tracking-wider uppercase text-white font-black">
                🎮 LEVEL 1 ONBOARDING MISSION: <span className="text-[#00f0ff]">CONFIG ARCHAEOLOGY QUICKSTART</span>
              </CardTitle>
            </div>
            <Badge className="bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/50 font-mono text-xs uppercase tracking-wider">
              ⚡ LIVE ENGINE CONNECTED
            </Badge>
          </div>
          <CardDescription className="text-slate-300 font-sans text-sm mt-1">
            Welcome, Config Archaeologist! Never guess why an environment variable exists again. Follow these 3 simple steps to unearth hidden PR reasoning and prevent production outages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 relative group hover:border-[#00f0ff]/40 transition-all">
              <div className="text-[10px] text-[#00f0ff] font-bold uppercase tracking-wider mb-1">STEP 1: TARGET MICROSERVICE</div>
              <div className="text-sm font-bold text-white mb-2">Choose Target Codebase</div>
              <p className="text-slate-400 text-xs mb-3 font-sans">Select which service's config history you want to inspect in the memory graph.</p>
              <div className="flex flex-wrap gap-1.5">
                {["payments-api", "billing-service", "auth-gateway"].map((srv) => (
                  <button
                    key={srv}
                    onClick={() => setService(srv)}
                    className={`px-2.5 py-1 rounded text-[11px] transition-all uppercase border ${
                      service === srv 
                        ? "bg-[#00f0ff]/30 text-[#00f0ff] border-[#00f0ff] font-bold" 
                        : "bg-slate-800/60 text-slate-400 border-white/5 hover:border-white/20"
                    }`}
                  >
                    ⚡ {srv}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 relative group hover:border-[#ffaa00]/40 transition-all">
              <div className="text-[10px] text-[#ffaa00] font-bold uppercase tracking-wider mb-1">STEP 2: CHOOSE WEAPON</div>
              <div className="text-sm font-bold text-white mb-2">Select Investigation Mode</div>
              <p className="text-slate-400 text-xs mb-3 font-sans">Scan a key, report a broken deployment (negative feedback), or audit an entire `.env` file.</p>
              <div className="flex flex-wrap gap-1.5">
                <button 
                  onClick={() => setActiveTab("scan")}
                  className={`px-2.5 py-1 rounded text-[11px] uppercase border ${activeTab === "scan" ? "bg-[#ffaa00]/30 text-[#ffaa00] border-[#ffaa00] font-bold" : "bg-slate-800/60 text-slate-400 border-white/5"}`}
                >
                  🔍 Single Scan
                </button>
                <button 
                  onClick={() => setActiveTab("incident")}
                  className={`px-2.5 py-1 rounded text-[11px] uppercase border ${activeTab === "incident" ? "bg-[#ff003c]/30 text-[#ff003c] border-[#ff003c] font-bold" : "bg-slate-800/60 text-slate-400 border-white/5"}`}
                >
                  🚨 Outage Report
                </button>
                <button 
                  onClick={() => setActiveTab("audit")}
                  className={`px-2.5 py-1 rounded text-[11px] uppercase border ${activeTab === "audit" ? "bg-[#00f0ff]/30 text-[#00f0ff] border-[#00f0ff] font-bold" : "bg-slate-800/60 text-slate-400 border-white/5"}`}
                >
                  🛡️ Env Audit
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 relative group hover:border-[#ff003c]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-[#ff003c] font-bold uppercase tracking-wider mb-1">STEP 3: LAUNCH MISSION</div>
                <div className="text-sm font-bold text-white mb-2">Instant Scan Try-Me Tags</div>
                <p className="text-slate-400 text-xs mb-3 font-sans">Click any key below to launch an immediate archaeology scan right now!</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["DB_POOL_SIZE", "REQUEST_TIMEOUT", "MAX_RETRIES", "CACHE_TTL"].map((k) => (
                  <button
                    key={k}
                    onClick={() => handleTryPreset(k)}
                    className="px-2.5 py-1 rounded bg-[#ff003c]/20 hover:bg-[#ff003c]/40 text-[#ffb3c6] border border-[#ff003c]/40 text-[11px] font-mono font-bold transition-all flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" /> {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FEEDBACK BANNER (IF SET) */}
      {feedbackMsg && (
        <Alert className="border-[#00f0ff] bg-[#00f0ff]/10 text-white font-mono text-xs animate-in fade-in duration-300">
          <Zap className="h-4 w-4 text-[#00f0ff]" />
          <AlertTitle className="font-bold text-[#00f0ff] uppercase tracking-wider">Self-Improving Feedback Loop Triggered</AlertTitle>
          <AlertDescription className="text-slate-200 mt-1">{feedbackMsg}</AlertDescription>
        </Alert>
      )}

      {/* MAIN MISSION WEAPONS TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-black/60 border border-white/10 p-1 rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="scan" className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 data-[state=active]:bg-[#00f0ff] data-[state=active]:text-black font-bold">
            🔍 Variable Archaeology Scan
          </TabsTrigger>
          <TabsTrigger value="incident" className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 data-[state=active]:bg-[#ff003c] data-[state=active]:text-white font-bold">
            🚨 Report Production Outage (cognee.improve -)
          </TabsTrigger>
          <TabsTrigger value="safe" className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-black font-bold">
            ✅ Report Safe Deployment (cognee.improve +)
          </TabsTrigger>
          <TabsTrigger value="audit" className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 data-[state=active]:bg-[#ffaa00] data-[state=active]:text-black font-bold">
            🛡️ Batch .env File Audit
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: VARIABLE ARCHAEOLOGY SCAN */}
        <TabsContent value="scan" className="space-y-6">
          <Card className="glass-panel border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-mono tracking-wider uppercase text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#00f0ff]" /> Search Config Archaeology Memory
              </CardTitle>
              <CardDescription className="text-slate-400 font-sans text-xs">
                Enter any environment variable or configuration key. Capi will search Git blame, PR descriptions, and past outage reports to explain why this exact value was chosen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScanSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" /> Config Variable Key Name
                    </label>
                    <Input 
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="e.g. DB_POOL_SIZE, REQUEST_TIMEOUT"
                      className="bg-black/60 border-white/20 text-white font-mono text-sm h-11 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]"
                      required
                    />
                    <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 pt-1">
                      <span>Try:</span>
                      {["DB_POOL_SIZE", "REQUEST_TIMEOUT", "MAX_RETRIES", "WORKER_THREADS", "OLD_FEATURE_FLAG"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setKeyName(tag)}
                          className="text-[#00f0ff] hover:underline bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                        >
                          [{tag}]
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                      Target Service
                    </label>
                    <Input 
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      placeholder="e.g. payments-api"
                      className="bg-black/60 border-white/20 text-white font-mono text-sm h-11 focus:border-[#00f0ff]"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-mono font-black text-xs uppercase tracking-widest px-8 py-6 rounded-xl shadow-lg shadow-[#00f0ff]/25 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        <span>UNEARTHING GRAPH...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>LAUNCH ARCHAEOLOGY SCAN</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* QUERY RESULT DISPLAY */}
          <QueryResult data={result} loading={loading} />
        </TabsContent>

        {/* TAB 2: REPORT PRODUCTION OUTAGE */}
        <TabsContent value="incident" className="space-y-6">
          <Card className="glass-panel border-[#ff003c]/40 neon-glow-crimson text-white">
            <CardHeader>
              <CardTitle className="text-xl font-mono tracking-wider uppercase text-[#ff003c] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Trigger Negative Feedback Loop (`cognee.improve`)
              </CardTitle>
              <CardDescription className="text-slate-300 font-sans text-xs leading-relaxed">
                <strong className="text-white">What does this do?</strong> When a production outage occurs due to a bad config value, reporting it here triggers Capi's self-improving negative feedback loop. It permanently increases the variable's Danger Score in memory so no engineer makes the same mistake again!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIncidentSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#ff003c] uppercase font-bold">Culprit Config Key</label>
                    <Input 
                      value={incKey} 
                      onChange={(e) => setIncKey(e.target.value)} 
                      className="bg-black/60 border-[#ff003c]/40 text-white font-mono h-10" 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 uppercase">Service Name</label>
                    <Input 
                      value={service} 
                      onChange={(e) => setService(e.target.value)} 
                      className="bg-black/60 border-white/20 text-white font-mono h-10" 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#ffaa00] uppercase font-bold">Outage Severity</label>
                    <div className="flex gap-2">
                      {["P1", "P2", "P3"].map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setIncSeverity(sev)}
                          className={`flex-1 py-2 rounded uppercase font-bold border transition-all ${
                            incSeverity === sev 
                              ? "bg-[#ff003c]/30 text-[#ff003c] border-[#ff003c] neon-glow-crimson" 
                              : "bg-black/40 text-slate-400 border-white/10"
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 uppercase flex items-center justify-between">
                    <span>Incident Root Cause / Post-Mortem Notes</span>
                    <span className="text-[10px] text-slate-500 font-sans">Explain what broke in production</span>
                  </label>
                  <textarea 
                    value={incNotes}
                    onChange={(e) => setIncNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-black/60 border border-white/20 rounded-lg p-3 text-white font-mono text-xs focus:border-[#ff003c] focus:outline-none"
                    placeholder="e.g. Setting DB_POOL_SIZE > 20 caused retry amplification storm during flash sale."
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#ff003c] hover:bg-[#ff003c]/80 text-white font-mono font-black text-xs uppercase tracking-widest px-8 py-5 rounded-xl shadow-lg shadow-[#ff003c]/30"
                  >
                    🚨 RECORD OUTAGE & PENALIZE DANGER SCORE (+20)
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: REPORT SAFE DEPLOYMENT */}
        <TabsContent value="safe" className="space-y-6">
          <Card className="glass-panel border-emerald-500/40 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-mono tracking-wider uppercase text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Trigger Positive Feedback Loop (`cognee.improve`)
              </CardTitle>
              <CardDescription className="text-slate-300 font-sans text-xs leading-relaxed">
                <strong className="text-white">What does this do?</strong> When an engineer deploys a config change cleanly to production without causing any alarms or outages, recording it here triggers a positive feedback loop, reducing its Danger Score (-10) in memory!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSafeSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-emerald-400 uppercase font-bold">Verified Safe Config Key</label>
                    <Input 
                      value={safeKey} 
                      onChange={(e) => setSafeKey(e.target.value)} 
                      className="bg-black/60 border-emerald-500/40 text-white font-mono h-10" 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 uppercase">Service Name</label>
                    <Input 
                      value={service} 
                      onChange={(e) => setService(e.target.value)} 
                      className="bg-black/60 border-white/20 text-white font-mono h-10" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-black text-xs uppercase tracking-widest px-8 py-5 rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    ✅ RECORD CLEAN DEPLOY & REDUCE DANGER SCORE (-10)
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: BATCH ENV FILE AUDIT */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="glass-panel border-[#ffaa00]/40 neon-glow-amber text-white">
            <CardHeader>
              <CardTitle className="text-xl font-mono tracking-wider uppercase text-[#ffaa00] flex items-center gap-2">
                <Upload className="w-5 h-5" /> Batch Codebase `.env` Audit
              </CardTitle>
              <CardDescription className="text-slate-300 font-sans text-xs leading-relaxed">
                <strong className="text-white">What does this do?</strong> Paste any `.env` file content from your local workflow or CI/CD pipeline below. Capi will scan every single variable in batch against historical outage memory to catch hidden risks before you commit!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Paste Environment Variables (`.env`)</span>
                  <span className="text-[10px] text-[#00f0ff] cursor-pointer hover:underline" onClick={() => setEnvContent("DB_POOL_SIZE=25\nREQUEST_TIMEOUT=20\nMAX_RETRIES=20\nCACHE_TTL=15\nWORKER_THREADS=15\nOLD_FEATURE_FLAG=true")}>
                    ⚡ Load High-Risk Sample .env
                  </span>
                </label>
                <textarea 
                  value={envContent}
                  onChange={(e) => setEnvContent(e.target.value)}
                  rows={6}
                  className="w-full bg-black/80 border border-white/20 rounded-xl p-3 font-mono text-xs text-[#00f0ff] focus:border-[#ffaa00] focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleEnvAudit} 
                  disabled={loading}
                  className="bg-[#ffaa00] hover:bg-[#ffaa00]/80 text-black font-mono font-black text-xs uppercase tracking-widest px-8 py-5 rounded-xl shadow-lg shadow-[#ffaa00]/20 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" /> RUN BATCH DANGER AUDIT
                </Button>
              </div>

              {/* Audit Results Table */}
              {auditResults && auditResults.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10 animate-in fade-in duration-500">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    ⚡ Audit Scan Summary ({auditResults.length} Variables Checked)
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/60">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-white/5 text-slate-400 border-b border-white/10 uppercase">
                        <tr>
                          <th className="p-3">Variable Key</th>
                          <th className="p-3">Danger Score</th>
                          <th className="p-3">Safety Status</th>
                          <th className="p-3">Root Cause Notice / Provenance Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {auditResults.map((r, i) => {
                          const s = r.danger_score !== undefined ? r.danger_score : 15;
                          const isDng = s >= 40 || r.caused_outage;
                          const isDep = r.deprecated || r.status === "DEPRECATED";
                          return (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="p-3 font-bold text-white">{r.key}</td>
                              <td className="p-3">
                                <span className={`font-black text-sm ${isDng ? "text-[#ff003c]" : s >= 20 ? "text-[#ffaa00]" : "text-[#00f0ff]"}`}>
                                  {s}/100
                                </span>
                              </td>
                              <td className="p-3">
                                {isDep ? (
                                  <Badge className="bg-slate-700/40 text-slate-300 border border-slate-500 uppercase text-[10px]">🗑️ DEPRECATED</Badge>
                                ) : isDng ? (
                                  <Badge className="bg-[#ff003c]/20 text-[#ff003c] border border-[#ff003c]/50 uppercase text-[10px]">🔴 HIGH RISK</Badge>
                                ) : s >= 20 ? (
                                  <Badge className="bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/50 uppercase text-[10px]">🟡 CAUTION</Badge>
                                ) : (
                                  <Badge className="bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 uppercase text-[10px]">🟢 SAFE</Badge>
                                )}
                              </td>
                              <td className="p-3 text-slate-400 text-[11px] leading-relaxed max-w-md break-words">
                                {r.warning_msg ? (
                                  <span className="text-[#ffb3c6] font-bold">🚨 {r.warning_msg}</span>
                                ) : r.provenance && r.provenance.length > 0 ? (
                                  r.provenance[0]
                                ) : (
                                  "Standard configuration value."
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
