"use client";

import React, { useState } from "react";
import Link from "next/link";
import GraphView from "@/components/GraphView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Network, Terminal, Search, Zap, ShieldCheck } from "lucide-react";

export default function GraphExplorerPage() {
  const [service, setService] = useState<string>("payments-api");
  const [inputVal, setInputVal] = useState<string>("payments-api");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setService(inputVal.trim());
    }
  };

  const selectPreset = (preset: string) => {
    setInputVal(preset);
    setService(preset);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Cyber Navigation Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] neon-glow-cyan">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#00f0ff] uppercase tracking-widest">
              <span>COGNEE ENGINE V1</span>
              <span>•</span>
              <span>FORCE-DIRECTED GRAPH</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-mono text-white">
              Capi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ffaa00]">Knowledge Graph</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="outline" className="border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/10 font-mono text-xs uppercase tracking-wider">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Mission Control
            </Button>
          </Link>
        </div>
      </header>

      {/* Target Service Selector / Gamified Level Bar */}
      <div className="glass-panel p-4 rounded-xl border-[#00f0ff]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-5 h-5 text-[#00f0ff] shrink-0" />
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
            Target Microservice Graph:
          </span>
          <div className="flex flex-wrap gap-2">
            {["payments-api", "billing-service", "auth-gateway"].map((preset) => (
              <button
                key={preset}
                onClick={() => selectPreset(preset)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all uppercase border ${
                  service === preset 
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff] neon-glow-cyan font-bold" 
                    : "bg-black/40 text-slate-400 border-white/10 hover:border-white/30"
                }`}
              >
                ⚡ {preset}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <Input 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Custom microservice..."
            className="w-48 bg-black/60 border-white/20 text-white font-mono text-xs focus:border-[#00f0ff]"
          />
          <Button type="submit" size="sm" className="bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-mono text-xs font-bold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5 mr-1" /> Load
          </Button>
        </form>
      </div>

      {/* Main Force Graph Explorer */}
      <GraphView serviceName={service} />
    </main>
  );
}
