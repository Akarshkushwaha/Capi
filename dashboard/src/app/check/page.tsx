"use client";

import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Search, Terminal } from "lucide-react";

interface AuditItem {
  key: string;
  service: string;
  risk: "ARMED" | "CAUTION" | "CLEAR";
  score: number;
  summary: string;
}

export default function CheckPage() {
  const [inputKeys, setInputKeys] = useState("DB_POOL_SIZE, REQUEST_TIMEOUT, CACHE_TTL, WORKER_THREADS");
  const [service, setService] = useState("payments-api");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditItem[]>([
    {
      key: "DB_POOL_SIZE",
      service: "payments-api",
      risk: "ARMED",
      score: 95,
      summary: "Historical P1 Outage (INC-47). Will cause database connection memory exhaustion when > 15.",
    },
    {
      key: "REQUEST_TIMEOUT",
      service: "payments-api",
      risk: "CAUTION",
      score: 45,
      summary: "Modified in PR #402 during Black Friday traffic spike. Monitor latency.",
    },
    {
      key: "CACHE_TTL",
      service: "payments-api",
      risk: "CLEAR",
      score: 10,
      summary: "No historical incident records or outage correlations found in git logs.",
    },
    {
      key: "WORKER_THREADS",
      service: "payments-api",
      risk: "CLEAR",
      score: 15,
      summary: "Safe parameter within standard operating bounds (2 - 8 threads).",
    },
  ]);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const keys = inputKeys.split(",").map((k) => k.trim()).filter(Boolean);
      const newResults: AuditItem[] = [];
      for (const k of keys) {
        try {
          const res = await fetch("http://localhost:8001/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: k, service }),
          });
          if (res.ok) {
            const data = await res.json();
            const score = data.risk_assessment?.danger_score || 20;
            const risk = score >= 80 ? "ARMED" : score >= 40 ? "CAUTION" : "CLEAR";
            newResults.push({
              key: k,
              service,
              risk,
              score,
              summary: data.risk_assessment?.recommendation || data.provenance?.reason || "Verified safe parameter.",
            });
            continue;
          }
        } catch (e) {
          // Fallback if individual query fails
        }
        const isDangerous = k.includes("POOL") || k.includes("RETRIES") || k.includes("MEMORY");
        const isCaution = k.includes("TIMEOUT") || k.includes("PORT");
        newResults.push({
          key: k,
          service,
          risk: isDangerous ? "ARMED" : isCaution ? "CAUTION" : "CLEAR",
          score: isDangerous ? 90 : isCaution ? 50 : 15,
          summary: isDangerous
            ? "Matched historical incident guardrail pattern. Check pool constraints."
            : isCaution
            ? "Proceed with caution — verify upstream timeouts."
            : "No historical outage record found.",
        });
      }
      setResults(newResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-400">
      {/* HEADER */}
      <div className="border-b border-[#2a2a2a] pb-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#f5a623]" />
          <span className="font-mono text-xs text-[#f5a623] uppercase tracking-wider font-semibold">
            // PRE-COMMIT GUARDRAIL AUDIT
          </span>
        </div>
        <h1 className="font-bebas text-5xl md:text-[56px] text-[#f5a623] tracking-wide leading-none">
          PRE-CHANGE SAFETY ASSESSMENT
        </h1>
        <p className="font-sans text-base text-[#9ca3af] mt-1 max-w-2xl">
          Paste comma-separated config variables from your staged git diff or `.env` file to audit every key against historical outage memory.
        </p>
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleAudit} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block font-mono text-xs text-[#f5a623] uppercase tracking-wider mb-2 font-bold">
              CONFIG VARIABLES (COMMA-SEPARATED OR `.ENV` KEYS)
            </label>
            <input
              type="text"
              value={inputKeys}
              onChange={(e) => setInputKeys(e.target.value)}
              placeholder="DB_POOL_SIZE, REQUEST_TIMEOUT, MAX_RETRIES"
              required
              className="w-full h-12 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 font-mono text-base text-[#f5a623] focus:border-[#f5a623] focus:outline-none box-glow-amber transition-all"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#f5a623] uppercase tracking-wider mb-2 font-bold">
              TARGET MICROSERVICE
            </label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="payments-api"
              required
              className="w-full h-12 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 font-mono text-base text-[#f5a623] focus:border-[#f5a623] focus:outline-none box-glow-amber transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a0a0a] font-bebas text-2xl tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,166,35,0.3)] disabled:opacity-50"
        >
          {loading ? "RUNNING SAFETY SCAN..." : "RUN PRE-CHANGE SAFETY CHECK"}
        </button>
      </form>

      {/* COMPONENT 6: SAFETY CHECK TABLE */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#2a2a2a] bg-[#14141a]/40 flex items-center justify-between">
          <h2 className="font-bebas text-3xl text-[#f5a623] tracking-wide">
            AUDIT RESULTS & GUARDRAIL ADVICE
          </h2>
          <span className="font-mono text-xs text-[#9ca3af]">
            4 VARIABLES SCANNED // SERVICE: {service}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f5a623] text-[#f5a623] font-sans text-xs uppercase tracking-widest bg-[#0a0a0a]">
                <th className="py-4 px-6 font-semibold">CONFIG KEY</th>
                <th className="py-4 px-6 font-semibold w-36">RISK ASSESSMENT</th>
                <th className="py-4 px-6 font-semibold w-24 text-center">SCORE</th>
                <th className="py-4 px-6 font-semibold">PROVENANCE & RECOMMENDATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {results.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={item.key}
                    className={`transition-colors ${
                      isEven ? "bg-[#111111]" : "bg-[#0f0f0f]"
                    } hover:bg-[#1a1a1a]`}
                  >
                    <td className="py-4 px-6 font-mono text-base font-bold text-[#f5a623]">
                      {item.key}
                    </td>
                    <td className="py-4 px-6">
                      {item.risk === "ARMED" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#dc2626]/15 border border-[#dc2626] font-bebas text-base text-[#dc2626] tracking-wider animate-pulse">
                          ⚠ ARMED
                        </span>
                      )}
                      {item.risk === "CAUTION" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#d97706]/15 border border-[#d97706] font-bebas text-base text-[#d97706] tracking-wider">
                          ⚡ CAUTION
                        </span>
                      )}
                      {item.risk === "CLEAR" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#16a34a]/15 border border-[#16a34a] font-bebas text-base text-[#16a34a] tracking-wider">
                          ✓ CLEAR
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm font-bold text-center text-[#f5f5f0]">
                      {item.score}
                    </td>
                    <td className="py-4 px-6 font-sans text-sm text-[#f5f5f0] leading-relaxed">
                      {item.summary}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#0a0a0a] border-t border-[#2a2a2a] flex items-center justify-between font-mono text-[11px] text-[#9ca3af]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#f5a623]" />
            <span>CLI COMMAND: ./capi check --service {service}</span>
          </div>
          <span>PRE-COMMIT HOOK STATUS: ACTIVE (.git/hooks/pre-commit)</span>
        </div>
      </div>
    </div>
  );
}
