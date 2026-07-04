"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  GitCommit, 
  GitPullRequest, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Terminal, 
  Zap, 
  History, 
  HelpCircle,
  TrendingUp,
  Activity
} from "lucide-react";

export interface ArchaeologyResult {
  key?: string;
  service?: string;
  provenance?: string[];
  incidents?: string[];
  notes?: string;
  danger_score?: number;
  caused_outage?: boolean;
  warning_msg?: string;
  deprecated?: boolean;
  status?: string;
  error?: string;
  message?: string;
}

interface QueryResultProps {
  data: ArchaeologyResult | null;
  loading?: boolean;
}

export default function QueryResult({ data, loading }: QueryResultProps) {
  if (loading) {
    return (
      <Card className="glass-panel border-[#00f0ff]/30 text-white animate-pulse">
        <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#00f0ff] border-t-transparent animate-spin" />
          <p className="text-[#00f0ff] font-mono tracking-widest text-sm uppercase">
            ⚡ SCANNING ARCHAEOLOGY MEMORY GRAPH...
          </p>
          <p className="text-xs text-slate-400 text-center max-w-md">
            Unearthing historical Git blame commits, PR discussions, and P1 outage reports across your microservices...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  if (data.error) {
    return (
      <Alert className="border-[#ff003c] bg-[#ff003c]/10 text-[#ff003c] neon-glow-crimson">
        <AlertTriangle className="h-5 w-5 text-[#ff003c]" />
        <AlertTitle className="font-bold tracking-wider uppercase font-mono">Scan Error</AlertTitle>
        <AlertDescription className="text-slate-300 font-mono text-xs mt-1">
          {data.error}
        </AlertDescription>
      </Alert>
    );
  }

  // Derive danger score and status
  const score = data.danger_score !== undefined ? data.danger_score : (data.caused_outage ? 50 : 15);
  const isDanger = score >= 40 || data.caused_outage || (data.incidents && data.incidents.length > 0);
  const isCaution = score >= 20 && !isDanger;
  const isDeprecated = data.deprecated || data.status === "DEPRECATED";

  let statusBadge = (
    <Badge className="bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 px-3 py-1 font-mono text-xs uppercase tracking-wider">
      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline" /> Safe Operating Range
    </Badge>
  );

  let borderGlow = "border-[#00f0ff]/30 neon-glow-cyan";
  let scoreColor = "text-[#00f0ff]";

  if (isDeprecated) {
    statusBadge = (
      <Badge className="bg-slate-700/40 text-slate-300 border border-slate-500 px-3 py-1 font-mono text-xs uppercase tracking-wider">
        🗑️ Deprecated / Removed
      </Badge>
    );
    borderGlow = "border-slate-600/40";
    scoreColor = "text-slate-400";
  } else if (isDanger) {
    statusBadge = (
      <Badge className="bg-[#ff003c]/20 text-[#ff003c] border border-[#ff003c]/60 px-3 py-1 font-mono text-xs uppercase tracking-wider animate-pulse-fast">
        <ShieldAlert className="w-3.5 h-3.5 mr-1.5 inline" /> High Danger Risk
      </Badge>
    );
    borderGlow = "border-[#ff003c]/50 neon-glow-crimson";
    scoreColor = "text-[#ff003c]";
  } else if (isCaution) {
    statusBadge = (
      <Badge className="bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/60 px-3 py-1 font-mono text-xs uppercase tracking-wider">
        <AlertTriangle className="w-3.5 h-3.5 mr-1.5 inline" /> Moderate Caution
      </Badge>
    );
    borderGlow = "border-[#ffaa00]/40 neon-glow-amber";
    scoreColor = "text-[#ffaa00]";
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Archaeology Card */}
      <Card className={`glass-panel text-white ${borderGlow} transition-all duration-300`}>
        <CardHeader className="border-b border-white/10 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-1">
                <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>MICROSERVICE: <strong className="text-white">{data.service || "payments-api"}</strong></span>
                <span>•</span>
                <span>ARCHAEOLOGY RECORD</span>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#00f0ff]">
                {data.key || "CONFIG_VARIABLE"}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Danger Meter</div>
                <div className={`text-2xl font-black font-mono ${scoreColor}`}>
                  {score}/100
                </div>
              </div>
              {statusBadge}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Feature Explanation Banner for User Understanding */}
          <div className="bg-slate-900/80 border border-[#00f0ff]/20 rounded-lg p-3 flex items-start space-x-3 text-xs text-slate-300">
            <HelpCircle className="w-5 h-5 text-[#00f0ff] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider">What does this result mean?</span>
              <p className="mt-0.5 leading-relaxed text-slate-400">
                Instead of guessing why <code className="text-[#00f0ff] bg-black/40 px-1 rounded">{data.key}</code> exists, Capi queried your engineering memory graph. Below are the exact Git commits, PR discussions, and historical production outages linked to this setting.
              </p>
            </div>
          </div>

          {/* Root Cause Warning Notice */}
          {(data.warning_msg || isDanger) && (
            <Alert className="border-[#ff003c]/60 bg-[#ff003c]/15 text-white">
              <ShieldAlert className="h-5 w-5 text-[#ff003c]" />
              <AlertTitle className="font-bold text-[#ff003c] font-mono tracking-wider uppercase flex items-center gap-2">
                🚨 Root Cause Notice • Historical Production Incident
              </AlertTitle>
              <AlertDescription className="text-slate-200 font-mono text-xs mt-2 leading-relaxed">
                {data.warning_msg || "Outage [P1]: Downstream timeout caused retry amplification storm. Do not modify without verifying downstream connection limits!"}
              </AlertDescription>
            </Alert>
          )}

          {/* Provenance Section (Git Commits & PRs) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-[#00f0ff] flex items-center gap-2">
              <History className="w-4 h-4" /> Why does this value exist? (Git & PR Provenance)
            </h3>
            {data.provenance && data.provenance.length > 0 ? (
              <div className="space-y-2">
                {data.provenance.map((prov, i) => {
                  const isPR = prov.toLowerCase().includes("pr #") || prov.toLowerCase().includes("pull request");
                  return (
                    <div 
                      key={i} 
                      className="p-3.5 rounded-lg bg-black/40 border border-white/10 hover:border-[#00f0ff]/40 transition-colors flex items-start space-x-3 text-xs font-mono"
                    >
                      {isPR ? (
                        <GitPullRequest className="w-4 h-4 text-[#bf00ff] shrink-0 mt-0.5" />
                      ) : (
                        <GitCommit className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
                      )}
                      <div className="text-slate-300 leading-relaxed flex-1 break-words">
                        {prov}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-500 italic bg-black/20 p-3 rounded border border-white/5">
                No historical git commits or PR descriptions found for this key in the open-source graph.
              </p>
            )}
          </div>

          {/* Past Incidents & Outages Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-[#ff003c] flex items-center gap-2">
              <Activity className="w-4 h-4" /> Linked Production Outages & Incidents
            </h3>
            {data.incidents && data.incidents.length > 0 ? (
              <div className="space-y-2">
                {data.incidents.map((inc, i) => (
                  <div 
                    key={i} 
                    className="p-3.5 rounded-lg bg-[#ff003c]/10 border border-[#ff003c]/30 flex items-start space-x-3 text-xs font-mono text-[#ffb3c6]"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#ff003c] shrink-0 mt-0.5" />
                    <div className="leading-relaxed flex-1 break-words">
                      {inc}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-emerald-400/80 bg-emerald-950/20 p-3 rounded border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No production outages or P1 incidents have been linked to this config variable in memory.
              </p>
            )}
          </div>

          {/* Safe Range Recommendations */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00f0ff]" />
              <span>Recommended Safe Range: <strong className="text-white">Verify against downstream capacity before increasing.</strong></span>
            </div>
            <div className="text-[11px] text-slate-500">
              Powered by <span className="text-white font-bold">Cognee Graph Memory</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
