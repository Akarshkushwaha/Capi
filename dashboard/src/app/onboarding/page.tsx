"use client";

import React, { useState } from "react";
import { Sparkles, Terminal, Copy, Check, ShieldAlert, CheckCircle2, ArrowRight, Database, GitBranch, GitPullRequest, Zap, Play, Package, Cpu, Cloud } from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [installTab, setInstallTab] = useState<"pip" | "precommit" | "cicd">("pip");
  const [simulatedCommit, setSimulatedCommit] = useState<"idle" | "running" | "blocked" | "success">("idle");
  const [repoPath, setRepoPath] = useState("/home/akarsh/my-production-service");
  const [serviceName, setServiceName] = useState("billing-gateway");
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "done">("idle");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleSimulateCommit = () => {
    setSimulatedCommit("running");
    setTimeout(() => {
      setSimulatedCommit("blocked");
    }, 1200);
  };

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    setScanStatus("scanning");
    setTimeout(() => {
      setScanStatus("done");
    }, 1500);
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-400 pb-12">
      {/* HEADER */}
      <div className="text-center space-y-4 pt-4 border-b border-[#2a2a2a] pb-8">
        <div className="inline-flex items-center gap-2 bg-[#f5a623]/10 border border-[#f5a623]/40 px-3 py-1 rounded-full text-[#f5a623] font-mono text-xs uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          // DETECTIVE WORKFLOW INDUCTION MANUAL
        </div>
        <h1 className="font-bebas text-5xl md:text-[64px] text-white tracking-wide leading-none">
          HOW TO INTEGRATE CAPI IN 30 SECONDS
        </h1>
        <p className="font-sans text-lg md:text-xl text-[#9ca3af] max-w-3xl mx-auto">
          **No cloning required.** Capi is distributed as a standalone CLI and standard Git pre-commit hook. Install it directly into your existing microservices or CI/CD pipelines with a single command.
        </p>

        {/* ARCHITECTURE & COGNEE ENGINE BADGES */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1.5 rounded-lg font-mono text-xs text-[#f5f5f0]">
            <Cpu className="w-4 h-4 text-[#16a34a]" />
            <span>ENGINE: <strong className="text-[#16a34a]">COGNEE OPEN SOURCE</strong> (Local FastEmbed + SQLite)</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1.5 rounded-lg font-mono text-xs text-[#f5f5f0]">
            <Cloud className="w-4 h-4 text-[#f5a623]" />
            <span>CLOUD READY: <strong className="text-[#f5a623]">COGNEE CLOUD API</strong> (Tenant Connected)</span>
          </div>
        </div>
      </div>

      {/* MISSION 1: THE GUARDRAIL WEAPON */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-[#f5a623]" />
        
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[#2a2a2a] pb-4">
          <div>
            <span className="font-mono text-xs text-[#f5a623] uppercase tracking-wider font-bold">
              // STEP 1 OF 3: ONE-LINE INSTALLATION & GIT HOOKS
            </span>
            <h2 className="font-bebas text-4xl text-white tracking-wide mt-1">
              CHOOSE YOUR INSTALLATION METHOD
            </h2>
          </div>
          <span className="font-mono text-xs bg-[#1a1a1a] px-3 py-1 rounded text-[#9ca3af] border border-[#2a2a2a]">
            ZERO REPO CLONING NEEDED
          </span>
        </div>

        <p className="font-sans text-base text-[#f5f5f0] leading-relaxed">
          You do **not** need to clone the Capi codebase into your workspace. Select how your team manages developer tooling:
        </p>

        {/* INSTALLATION METHOD TABS */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-[#2a2a2a] pb-3">
            <button
              type="button"
              onClick={() => setInstallTab("pip")}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                installTab === "pip"
                  ? "bg-[#f5a623] text-[#0a0a0a] shadow-[0_0_15px_rgba(245,166,35,0.3)]"
                  : "bg-[#1a1a1a] text-[#9ca3af] hover:text-white"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              1. Standalone Pip / CLI (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setInstallTab("precommit")}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                installTab === "precommit"
                  ? "bg-[#f5a623] text-[#0a0a0a] shadow-[0_0_15px_rgba(245,166,35,0.3)]"
                  : "bg-[#1a1a1a] text-[#9ca3af] hover:text-white"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              2. Git Pre-Commit Framework (.yaml)
            </button>
            <button
              type="button"
              onClick={() => setInstallTab("cicd")}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                installTab === "cicd"
                  ? "bg-[#f5a623] text-[#0a0a0a] shadow-[0_0_15px_rgba(245,166,35,0.3)]"
                  : "bg-[#1a1a1a] text-[#9ca3af] hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              3. GitHub Actions CI/CD Pipeline
            </button>
          </div>

          {/* TAB 1: PIP / CLI */}
          {installTab === "pip" && (
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 font-mono text-sm relative animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-[#9ca3af] text-xs mb-2 pb-2 border-b border-[#1a1a1a]">
                <span>bash — run inside any of your existing project repositories</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`pip install git+https://github.com/Akarshkushwaha/Capi.git\ncapi install-hook`, "tab_pip")}
                  className="flex items-center gap-1.5 text-[#f5a623] hover:text-[#fbbf24] transition-colors"
                >
                  {copiedCmd === "tab_pip" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd === "tab_pip" ? "COPIED!" : "COPY COMMANDS"}</span>
                </button>
              </div>
              <div className="space-y-1 text-[#22c55e]">
                <p className="text-[#9ca3af] text-xs"># Install globally or in your venv directly from GitHub:</p>
                <p><span className="text-[#9ca3af]">$</span> pip install git+https://github.com/Akarshkushwaha/Capi.git</p>
                <p className="text-[#9ca3af] text-xs pt-2"># Enable the guardrail hook in your current Git repo:</p>
                <p><span className="text-[#9ca3af]">$</span> capi install-hook</p>
                <p className="text-[#f5f5f0] pt-1 opacity-80">✓ Guardrail hook deployed to .git/hooks/pre-commit</p>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-COMMIT FRAMEWORK */}
          {installTab === "precommit" && (
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 font-mono text-sm relative animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-[#9ca3af] text-xs mb-2 pb-2 border-b border-[#1a1a1a]">
                <span>.pre-commit-config.yaml — add to your repository root</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`repos:\n  - repo: https://github.com/Akarshkushwaha/Capi\n    rev: main\n    hooks:\n      - id: capi-guardrail`, "tab_precommit")}
                  className="flex items-center gap-1.5 text-[#f5a623] hover:text-[#fbbf24] transition-colors"
                >
                  {copiedCmd === "tab_precommit" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd === "tab_precommit" ? "COPIED!" : "COPY YAML"}</span>
                </button>
              </div>
              <div className="space-y-1 text-[#f5a623]">
                <p className="text-[#f5f5f0]">repos:</p>
                <p className="text-[#f5f5f0]">{"  "}- repo: <span className="text-[#60a5fa]">https://github.com/Akarshkushwaha/Capi</span></p>
                <p className="text-[#f5f5f0]">{"    "}rev: <span className="text-[#22c55e]">main</span></p>
                <p className="text-[#f5f5f0]">{"    "}hooks:</p>
                <p className="text-[#f5f5f0]">{"      "}- id: <span className="text-[#f5a623]">capi-guardrail</span></p>
                <p className="text-[#9ca3af] text-xs pt-2"># Then run: pre-commit install</p>
              </div>
            </div>
          )}

          {/* TAB 3: CI/CD ACTIONS */}
          {installTab === "cicd" && (
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 font-mono text-sm relative animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-[#9ca3af] text-xs mb-2 pb-2 border-b border-[#1a1a1a]">
                <span>.github/workflows/capi-audit.yml — automated PR safety check</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`name: Capi Config Guardrail\non: [pull_request]\njobs:\n  audit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: pip install git+https://github.com/Akarshkushwaha/Capi.git\n      - run: capi check --service my-microservice`, "tab_cicd")}
                  className="flex items-center gap-1.5 text-[#f5a623] hover:text-[#fbbf24] transition-colors"
                >
                  {copiedCmd === "tab_cicd" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd === "tab_cicd" ? "COPIED!" : "COPY WORKFLOW"}</span>
                </button>
              </div>
              <div className="space-y-1 text-[#f5f5f0] text-xs">
                <p><span className="text-[#f5a623]">name:</span> Capi Config Guardrail</p>
                <p><span className="text-[#f5a623]">on:</span> [pull_request]</p>
                <p><span className="text-[#f5a623]">jobs:</span></p>
                <p>{"  "}<span className="text-[#f5a623]">audit:</span></p>
                <p>{"    "}<span className="text-[#f5a623]">runs-on:</span> ubuntu-latest</p>
                <p>{"    "}<span className="text-[#f5a623]">steps:</span></p>
                <p>{"      "}- <span className="text-[#60a5fa]">uses: actions/checkout@v4</span></p>
                <p>{"      "}- <span className="text-[#22c55e]">run: pip install git+https://github.com/Akarshkushwaha/Capi.git</span></p>
                <p>{"      "}- <span className="text-[#22c55e]">run: capi check --service my-microservice</span></p>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE SIMULATOR */}
        <div className="bg-[#1a1a1a]/60 border border-[#2a2a2a] rounded-lg p-5 space-y-4 mt-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-xs text-[#f5a623] uppercase font-semibold flex items-center gap-2">
              <Play className="w-3.5 h-3.5 fill-current" />
              // INTERACTIVE TEST: SIMULATE A DANGEROUS COMMIT IN YOUR REPO
            </span>
            <button
              type="button"
              onClick={handleSimulateCommit}
              disabled={simulatedCommit === "running"}
              className="px-4 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bebas text-lg tracking-wider rounded transition-all shadow-md disabled:opacity-50"
            >
              {simulatedCommit === "running" ? "INTERCEPTING..." : "SIMULATE: git commit -m 'bump DB_POOL_SIZE=25'"}
            </button>
          </div>

          {simulatedCommit === "blocked" && (
            <div className="bg-[#111111] border border-[#dc2626] rounded p-4 font-mono text-xs space-y-2 animate-in fade-in duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <div className="text-[#dc2626] font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 animate-bounce" />
                ⚠️ CAPI PRE-COMMIT GUARDRAIL ALERT! COMMIT BLOCKED!
              </div>
              <div className="text-[#f5f5f0] pl-4 border-l-2 border-[#dc2626] space-y-1 py-1">
                <p><span className="text-[#f5a623]">Key:</span> DB_POOL_SIZE | <span className="text-[#f5a623]">Proposed Value:</span> 25 (Current: 10)</p>
                <p><span className="text-[#f5a623]">Danger Score:</span> <strong className="text-[#dc2626]">95/100 (HIGH RISK)</strong></p>
                <p className="text-[#dc2626] pt-1">Historical Outage Detected: INC-47 (Production DB crashed due to connection memory exhaustion when set &gt; 15 on standard t2.micro instances).</p>
                <p className="text-[#16a34a] font-semibold pt-1">ACTION REQUIRED: Revert DB_POOL_SIZE to safe range (5 - 15) to commit.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MISSION 2: INGEST YOUR REPOSITORY */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-[#dc2626]" />
        
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[#2a2a2a] pb-4">
          <div>
            <span className="font-mono text-xs text-[#dc2626] uppercase tracking-wider font-bold">
              // STEP 2 OF 3: CODEBASE & GIT HISTORY INGESTION
            </span>
            <h2 className="font-bebas text-4xl text-white tracking-wide mt-1">
              CONNECT YOUR REAL REPOSITORIES & PULL REQUESTS
            </h2>
          </div>
          <span className="font-mono text-xs bg-[#1a1a1a] px-3 py-1 rounded text-[#9ca3af] border border-[#2a2a2a]">
            POWERED BY COGNEE HYBRID VECTOR GRAPH
          </span>
        </div>

        <p className="font-sans text-base text-[#f5f5f0] leading-relaxed">
          Once installed, run `capi ingest` in any project folder. Capi’s GitPython engine parses historical commit logs, extracts variable declarations, and constructs a causal graph in Cognee linking engineers to every variable change.
        </p>

        {/* Copyable bash snippet */}
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 font-mono text-sm relative group">
          <div className="flex items-center justify-between text-[#9ca3af] text-xs mb-2 pb-2 border-b border-[#1a1a1a]">
            <span>bash — terminal</span>
            <button
              type="button"
              onClick={() => copyToClipboard(`# Scan your current Git project commits & .env files\ncapi ingest . --service my-billing-service\n\n# Extract GitHub Pull Request review reasoning & discussions\ncapi ingest-prs --repo org/repo --token $GITHUB_TOKEN`, "cmd2")}
              className="flex items-center gap-1.5 text-[#f5a623] hover:text-[#fbbf24] transition-colors"
            >
              {copiedCmd === "cmd2" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === "cmd2" ? "COPIED!" : "COPY COMMANDS"}</span>
            </button>
          </div>
          <div className="space-y-2 text-[#22c55e]">
            <p className="text-[#9ca3af] font-mono text-xs"># 1. Scan your current Git project commits and .env files into Cognee graph memory:</p>
            <p><span className="text-[#9ca3af]">$</span> capi ingest . --service payments-api</p>
            <p className="text-[#9ca3af] font-mono text-xs pt-2"># 2. Extract GitHub Pull Request review reasoning & architecture discussions:</p>
            <p><span className="text-[#9ca3af]">$</span> capi ingest-prs --repo org/my-service --token $GITHUB_TOKEN</p>
          </div>
        </div>

        {/* LIVE SCAN SIMULATOR */}
        <form onSubmit={handleSimulateScan} className="bg-[#1a1a1a]/60 border border-[#2a2a2a] rounded-lg p-5 space-y-4">
          <div className="font-mono text-xs text-[#f5a623] uppercase font-semibold flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            // LIVE CODEBASE SCANNER (TEST INGESTION HUB)
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-mono text-[11px] text-[#9ca3af] uppercase mb-1">LOCAL REPOSITORY PATH</label>
              <input
                type="text"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded p-2.5 font-mono text-sm text-[#f5a623] focus:border-[#f5a623] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] text-[#9ca3af] uppercase mb-1">SERVICE NAME</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded p-2.5 font-mono text-sm text-[#f5a623] focus:border-[#f5a623] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={scanStatus === "scanning"}
              className="px-6 py-2.5 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a0a0a] font-bebas text-xl tracking-wider rounded transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              {scanStatus === "scanning" ? "SCANNING GIT COMMITS..." : "SIMULATE REPO INGESTION"}
            </button>

            {scanStatus === "done" && (
              <span className="font-mono text-xs text-[#16a34a] flex items-center gap-1.5 animate-in fade-in duration-300">
                <CheckCircle2 className="w-4 h-4" />
                ✓ 14 CONFIG KEYS INDEXED INTO COGNEE HYBRID GRAPH
              </span>
            )}
          </div>
        </form>
      </div>

      {/* MISSION 3: SELF-IMPROVING FEEDBACK LOOPS */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-[#16a34a]" />
        
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[#2a2a2a] pb-4">
          <div>
            <span className="font-mono text-xs text-[#16a34a] uppercase tracking-wider font-bold">
              // STEP 3 OF 3: SELF-IMPROVING FEEDBACK LOOPS (`cognee.improve`)
            </span>
            <h2 className="font-bebas text-4xl text-white tracking-wide mt-1">
              AUTOMATE CI/CD AUDITS & SLACK OUTAGE REWARDS
            </h2>
          </div>
          <span className="font-mono text-xs bg-[#1a1a1a] px-3 py-1 rounded text-[#9ca3af] border border-[#2a2a2a]">
            CONTINUOUS LEARNING
          </span>
        </div>

        <p className="font-sans text-base text-[#f5f5f0] leading-relaxed">
          Capi gets smarter every time your team ships code. Integrate our feedback commands into your CI/CD deployment scripts or Slack bot incident workflows. When a deployment is clean, Capi reduces the variable&apos;s Danger Score. When an outage occurs, Capi immediately penalizes the score so no engineer repeats the mistake.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Positive Feedback Box */}
          <div className="bg-[#16a34a]/10 border border-[#16a34a]/40 rounded-lg p-5 space-y-3">
            <div className="font-bebas text-2xl text-[#16a34a] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              POSITIVE FEEDBACK (SAFE DEPLOYMENT)
            </div>
            <p className="font-sans text-sm text-[#f5f5f0]/90">
              Run after a successful Kubernetes or Docker deployment in your CI/CD script:
            </p>
            <div className="bg-[#0a0a0a] p-3 rounded font-mono text-xs text-[#22c55e] border border-[#16a34a]/30">
              $ capi safe DB_POOL_SIZE --service payments-api
              <div className="text-[#9ca3af] pt-1"># Result: Danger score reduced (-10) in Cognee memory.</div>
            </div>
          </div>

          {/* Negative Feedback Box */}
          <div className="bg-[#dc2626]/10 border border-[#dc2626]/40 rounded-lg p-5 space-y-3">
            <div className="font-bebas text-2xl text-[#dc2626] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              NEGATIVE FEEDBACK (INCIDENT POST-MORTEM)
            </div>
            <p className="font-sans text-sm text-[#f5f5f0]/90">
              Run when a variable causes a P1/P2 outage or via Slack emergency webhook:
            </p>
            <div className="bg-[#0a0a0a] p-3 rounded font-mono text-xs text-[#ef4444] border border-[#dc2626]/30">
              $ capi incident DB_POOL_SIZE --service payments-api --severity P1
              <div className="text-[#9ca3af] pt-1"># Result: Danger score penalized (+20) in Cognee memory.</div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CALL TO ACTION */}
      <div className="bg-[#14141a] border border-[#f5a623]/40 rounded-xl p-8 text-center space-y-4 shadow-[0_0_40px_rgba(245,166,35,0.15)]">
        <h3 className="font-bebas text-4xl text-white tracking-wide">
          READY TO BECOME A CONFIG ARCHAEOLOGY DETECTIVE?
        </h3>
        <p className="font-sans text-base text-[#9ca3af] max-w-xl mx-auto">
          Start your first investigation right now on Mission Control or audit your team&apos;s staged configuration changes in seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/"
            className="px-8 py-3 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a0a0a] font-bebas text-2xl tracking-wider rounded-lg transition-transform hover:-translate-y-0.5 shadow-lg flex items-center gap-2"
          >
            <span>OPEN MISSION CONTROL</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/check"
            className="px-8 py-3 bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#f5a623] text-[#f5f5f0] font-bebas text-2xl tracking-wider rounded-lg transition-colors"
          >
            RUN PRE-CHANGE SAFETY CHECK
          </Link>
        </div>
      </div>
    </div>
  );
}
