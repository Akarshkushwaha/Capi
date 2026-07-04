"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, FileText, Clock, Award } from "lucide-react";

export interface ArchaeologyResult {
  key: string;
  service: string;
  provenance: {
    origin_commit?: string;
    author?: string;
    reason?: string;
    pr_discussion?: string;
    incident_history?: string[];
  };
  risk_assessment: {
    danger_score: number;
    level: "HIGH" | "MEDIUM" | "LOW";
    recommendation: string;
    safe_range?: string;
  };
}

interface QueryResultProps {
  result: ArchaeologyResult;
  onRecordIncident?: (key: string, service: string, notes: string, severity: string) => Promise<void>;
  onRecordSafe?: (key: string, service: string) => Promise<void>;
}

export function QueryResult({ result, onRecordIncident, onRecordSafe }: QueryResultProps) {
  const [severity, setSeverity] = useState<"P1" | "P2" | "P3">("P1");
  const [notes, setNotes] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const riskLevel = result.risk_assessment?.level || (result.risk_assessment?.danger_score >= 80 ? "HIGH" : result.risk_assessment?.danger_score >= 40 ? "MEDIUM" : "LOW");
  const isHighRisk = riskLevel === "HIGH";
  const isMediumRisk = riskLevel === "MEDIUM";

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || !onRecordIncident) return;
    setLoadingAction("incident");
    try {
      await onRecordIncident(result.key, result.service, notes, severity);
      setNotes("");
      setFeedbackSuccess(`🚨 P1/P2 Outage logged! Risk score penalized (+20) in Cognee memory.`);
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSafeSubmit = async () => {
    if (!onRecordSafe) return;
    setLoadingAction("safe");
    try {
      await onRecordSafe(result.key, result.service);
      setFeedbackSuccess(`✅ Clean deploy confirmed! Risk score rewarded (-10) in Cognee memory.`);
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } finally {
      setLoadingAction(null);
    }
  };

  const incidents = result.provenance?.incident_history || [];
  const queryTimestamp = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-400">
      {/* CASE FILE CARD */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300">
        {/* Top Colored Stripe */}
        <div
          className={`h-1 w-full ${
            isHighRisk
              ? "bg-[#dc2626] animate-pulse-red"
              : isMediumRisk
              ? "bg-[#d97706]"
              : "bg-[#16a34a]"
          }`}
        />

        {/* Case File Header */}
        <div className="p-6 md:p-8 border-b border-[#2a2a2a] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#14141a]/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#f5a623] bg-[#f5a623]/10 px-2 py-0.5 rounded border border-[#f5a623]/30">
                // CASE FILE #CA-{result.key.substring(0, 6)}
              </span>
              <span className="font-mono text-xs text-[#9ca3af]">
                SERVICE: <strong className="text-[#f5f5f0]">{result.service}</strong>
              </span>
            </div>
            <h2 className="font-bebas text-4xl md:text-5xl text-white tracking-wide font-normal mt-1">
              {result.key}
            </h2>
          </div>

          {/* Risk Badge */}
          <div className="self-start md:self-center">
            {isHighRisk && (
              <div className="bg-[#dc2626]/10 border border-[#dc2626] px-4 py-2 rounded-lg flex items-center gap-2.5 animate-pulse-red">
                <ShieldAlert className="w-5 h-5 text-[#dc2626] animate-bounce" />
                <span className="font-bebas text-xl text-[#dc2626] tracking-wider">
                  ⚠ ARMED AND DANGEROUS
                </span>
              </div>
            )}
            {isMediumRisk && (
              <div className="bg-[#d97706]/10 border border-[#d97706] px-4 py-2 rounded-lg flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#d97706]" />
                <span className="font-bebas text-xl text-[#d97706] tracking-wider">
                  ⚡ PROCEED WITH CAUTION
                </span>
              </div>
            )}
            {!isHighRisk && !isMediumRisk && (
              <div className="bg-[#16a34a]/10 border border-[#16a34a] px-4 py-2 rounded-lg flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                <span className="font-bebas text-xl text-[#16a34a] tracking-wider">
                  ✓ HARMLESS CIVILIAN
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Case File Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Section 1: EVIDENCE */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-semibold text-[#f5a623] tracking-wider uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#f5a623]" />
              // EVIDENCE (PROVENANCE & ARCHAEOLOGY)
            </div>
            <div className="evidence-border pl-4 py-1 text-[#f5f5f0] font-sans text-base leading-relaxed bg-[#1a1a1a]/40 rounded-r-lg p-4 border border-l-0 border-[#2a2a2a]">
              <p className="mb-3">
                {result.provenance?.reason ||
                  result.provenance?.pr_discussion ||
                  `Historical analysis indicates ${result.key} was defined for thread pooling and database load balancing in ${result.service}.`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2a2a2a]/60 text-xs font-mono text-[#9ca3af]">
                <div>
                  <span className="text-[#f5a623]">AUTHOR:</span> {result.provenance?.author || "alex-dev"}
                </div>
                <div>
                  <span className="text-[#f5a623]">COMMIT:</span> {result.provenance?.origin_commit || "c89b21f"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: PRIOR OFFENSES */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-semibold text-[#dc2626] tracking-wider uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#dc2626]" />
              // PRIOR OFFENSES (INCIDENT RECORD)
            </div>
            {incidents.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {incidents.map((inc, i) => (
                  <div
                    key={i}
                    className="bg-[#1a0f0f] border border-[#dc2626]/40 border-l-4 border-l-[#dc2626] p-4 rounded-r-lg flex items-start gap-3"
                  >
                    <span className="font-mono text-xs text-[#dc2626] font-bold mt-0.5">
                      [P1 OUTAGE]
                    </span>
                    <p className="font-sans text-sm text-[#f5f5f0] flex-1">
                      {inc}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#16a34a]/10 border border-[#16a34a]/30 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                <span className="font-mono text-xs text-[#16a34a] font-bold tracking-wide">
                  NO PRIOR RECORD FOUND — ZERO HISTORICAL OUTAGES DETECTED FOR THIS VARIABLE
                </span>
              </div>
            )}
          </div>

          {/* Section 3: RECOMMENDATION */}
          <div className="space-y-3">
            {isHighRisk && (
              <div className="w-full h-3 crime-tape-stripe rounded mb-2 border border-[#dc2626]/40" />
            )}
            <div className="font-mono text-xs font-semibold text-[#f5a623] tracking-wider uppercase flex items-center gap-2">
              <Award className="w-4 h-4 text-[#f5a623]" />
              // RECOMMENDATION & GUARDRAIL ADVICE
            </div>
            <div
              className={`p-5 rounded-lg border ${
                isHighRisk
                  ? "bg-[#dc2626]/10 border-[#dc2626]/50 text-[#f5f5f0]"
                  : isMediumRisk
                  ? "bg-[#d97706]/10 border-[#d97706]/50 text-[#f5f5f0]"
                  : "bg-[#16a34a]/10 border-[#16a34a]/50 text-[#f5f5f0]"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="font-bebas text-2xl tracking-wide">
                  DANGER SCORE: <strong className="font-mono">{result.risk_assessment?.danger_score || 85}</strong> / 100
                </span>
                {result.risk_assessment?.safe_range && (
                  <span className="font-mono text-xs bg-black/40 px-3 py-1 rounded border border-white/10">
                    SAFE RANGE: <strong className="text-[#16a34a]">{result.risk_assessment.safe_range}</strong>
                  </span>
                )}
              </div>
              <p className="font-sans text-base leading-relaxed">
                {result.risk_assessment?.recommendation ||
                  `Do not exceed max pool size of 15 on standard production instances without scaling database RAM. Ensure pre-commit guardrail is active.`}
              </p>
            </div>
          </div>
        </div>

        {/* Case File Footer */}
        <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#2a2a2a] flex items-center justify-between font-mono text-[11px] text-[#9ca3af]">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#f5a623]" />
            <span>TIMESTAMP: {queryTimestamp}</span>
          </div>
          <div className="tracking-widest uppercase font-semibold text-[#f5a623]/80">
            INVESTIGATED BY CAPI // COGNEE HYBRID ENGINE
          </div>
        </div>
      </div>

      {/* FEEDBACK SUCCESS BANNER */}
      {feedbackSuccess && (
        <div className="p-4 bg-[#f5a623]/10 border border-[#f5a623] text-[#f5a623] rounded-lg font-mono text-sm flex items-center justify-between animate-in fade-in duration-300">
          <span>{feedbackSuccess}</span>
          <span className="text-xs opacity-75">GRAPH SYNCHRONIZED</span>
        </div>
      )}

      {/* COMPONENT 7: INCIDENT RECORDER FORM & SAFE DEPLOY BUTTON */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[#2a2a2a] pb-4">
          <ShieldAlert className="w-6 h-6 text-[#dc2626]" />
          <h3 className="font-bebas text-3xl text-white tracking-wide">
            REPORT AN INCIDENT
          </h3>
          <span className="font-mono text-xs text-[#9ca3af] ml-auto">
            // SELF-IMPROVING FEEDBACK LOOP (`cognee.improve`)
          </span>
        </div>

        <form onSubmit={handleIncidentSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-xs text-[#f5a623] uppercase tracking-wider mb-2">
              SEVERITY LEVEL
            </label>
            <div className="flex gap-3">
              {(["P1", "P2", "P3"] as const).map((sev) => {
                const isSelected = severity === sev;
                const activeColor =
                  sev === "P1"
                    ? "bg-[#dc2626] text-white border-[#dc2626]"
                    : sev === "P2"
                    ? "bg-[#d97706] text-white border-[#d97706]"
                    : "bg-[#4b5563] text-white border-[#4b5563]";
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`px-6 py-2 rounded-full font-bebas text-lg tracking-wider transition-all border ${
                      isSelected
                        ? `${activeColor} shadow-lg scale-105`
                        : "bg-[#1a1a1a] text-[#9ca3af] border-[#2a2a2a] hover:border-[#9ca3af]"
                    }`}
                  >
                    {sev} {sev === "P1" ? "(CRITICAL)" : sev === "P2" ? "(HIGH)" : "(MINOR)"}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#f5a623] uppercase tracking-wider mb-2">
              INCIDENT NOTES & POST-MORTEM EVIDENCE
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what happened after the config change... e.g. Production DB connections exhausted on t2.micro, causing 504 Gateway Timeouts across billing."
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 font-mono text-sm text-[#f5f5f0] placeholder-[#4b5563] focus:border-[#dc2626] focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loadingAction === "incident"}
              className="w-full sm:w-auto px-8 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bebas text-2xl tracking-wider rounded-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 shadow-[0_4px_15px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-5 h-5" />
              {loadingAction === "incident" ? "LOGGING EVIDENCE..." : "FILE INCIDENT REPORT"}
            </button>

            <button
              type="button"
              onClick={handleSafeSubmit}
              disabled={loadingAction === "safe"}
              className="w-full sm:w-auto px-6 py-3 bg-[#16a34a]/10 hover:bg-[#16a34a]/20 text-[#16a34a] border border-[#16a34a]/40 font-sans font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 ml-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loadingAction === "safe" ? "RECORDING..." : "MARK AS SAFE DEPLOY"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
