"use client";

import React from "react";
import Link from "next/link";
import { FolderOpen, ArrowRight, ShieldAlert, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface CaseItem {
  id: string;
  key: string;
  service: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
  score: number;
  author: string;
  timestamp: string;
  summary: string;
}

export default function CasesPage() {
  const cases: CaseItem[] = [
    {
      id: "CA-8921",
      key: "DB_POOL_SIZE",
      service: "payments-api",
      risk: "HIGH",
      score: 95,
      author: "alex-dev",
      timestamp: "10 mins ago",
      summary: "Historical P1 Outage (INC-47). Database connection memory exhaustion when set > 15 on t2.micro.",
    },
    {
      id: "CA-7430",
      key: "REQUEST_TIMEOUT",
      service: "billing-service",
      risk: "MEDIUM",
      score: 45,
      author: "sarah-sre",
      timestamp: "1 hour ago",
      summary: "Modified in PR #402 after Black Friday traffic spikes. Upstream auth gateway timeout risk.",
    },
    {
      id: "CA-6119",
      key: "MAX_RETRIES",
      service: "auth-gateway",
      risk: "MEDIUM",
      score: 55,
      author: "mchen",
      timestamp: "3 hours ago",
      summary: "Webhook retry loop threshold. Exceeding 10 retries causes cascading rate limit failures.",
    },
    {
      id: "CA-5002",
      key: "CACHE_TTL",
      service: "payments-api",
      risk: "LOW",
      score: 10,
      author: "alex-dev",
      timestamp: "Yesterday",
      summary: "Redis session expiry duration. Verified safe parameter with no outage correlations.",
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-400">
      {/* HEADER */}
      <div className="border-b border-[#2a2a2a] pb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="w-4 h-4 text-[#f5a623]" />
            <span className="font-mono text-xs text-[#f5a623] uppercase tracking-wider font-semibold">
              // FILING CABINET & RECENT QUERIES
            </span>
          </div>
          <h1 className="font-bebas text-5xl md:text-[56px] text-[#f5a623] tracking-wide leading-none">
            ACTIVE CASES
          </h1>
          <p className="font-sans text-base text-[#9ca3af] mt-1 max-w-2xl">
            Recent config archaeology investigations conducted across your engineering team&apos;s repositories.
          </p>
        </div>

        <Link
          href="/investigate"
          className="px-6 py-2.5 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a0a0a] font-bebas text-xl tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(245,166,35,0.3)] flex items-center gap-2"
        >
          <span>OPEN NEW INVESTIGATION</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* CASES GRID */}
      <div className="grid grid-cols-1 gap-6">
        {cases.map((c) => {
          const isHigh = c.risk === "HIGH";
          const isMed = c.risk === "MEDIUM";
          return (
            <div
              key={c.id}
              className="bg-[#111111] border border-[#2a2a2a] hover:border-[#f5a623]/60 rounded-xl overflow-hidden transition-all duration-200 shadow-lg flex flex-col md:flex-row md:items-center justify-between"
            >
              {/* Left Color Bar */}
              <div
                className={`w-full md:w-2 h-2 md:h-auto self-stretch ${
                  isHigh ? "bg-[#dc2626] animate-pulse" : isMed ? "bg-[#d97706]" : "bg-[#16a34a]"
                }`}
              />

              {/* Main Info */}
              <div className="p-6 flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-[11px] bg-[#1a1a1a] px-2 py-0.5 rounded text-[#f5a623] border border-[#f5a623]/30">
                    #{c.id}
                  </span>
                  <span className="font-mono text-xs text-[#9ca3af]">
                    SERVICE: <strong className="text-white">{c.service}</strong>
                  </span>
                  <span className="font-mono text-xs text-[#9ca3af] flex items-center gap-1 ml-auto">
                    <Clock className="w-3 h-3 text-[#f5a623]" />
                    {c.timestamp}
                  </span>
                </div>

                <div className="flex items-baseline gap-4">
                  <h3 className="font-bebas text-3xl text-white tracking-wide">
                    {c.key}
                  </h3>
                  <span className="font-mono text-xs text-[#9ca3af]">
                    BY: <strong className="text-[#f5a623]">{c.author}</strong>
                  </span>
                </div>

                <p className="font-sans text-sm text-[#f5f5f0] max-w-3xl">
                  {c.summary}
                </p>
              </div>

              {/* Right Score & Action */}
              <div className="p-6 bg-[#14141a]/50 border-t md:border-t-0 md:border-l border-[#2a2a2a] flex md:flex-col items-center justify-between md:justify-center gap-4 min-w-[160px]">
                <div className="text-center">
                  <div className="font-mono text-[10px] text-[#9ca3af] uppercase">DANGER SCORE</div>
                  <div className={`font-mono text-3xl font-bold ${isHigh ? "text-[#dc2626]" : isMed ? "text-[#d97706]" : "text-[#16a34a]"}`}>
                    {c.score} <span className="text-xs font-normal text-[#9ca3af]">/100</span>
                  </div>
                </div>

                <Link
                  href="/investigate"
                  className="px-4 py-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#f5a623] text-[#f5f5f0] font-mono text-xs rounded transition-colors flex items-center gap-1"
                >
                  <span>INSPECT</span>
                  <ArrowRight className="w-3 h-3 text-[#f5a623]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
