"use client";

import React, { useEffect, useState } from "react";
import { GraphView, GraphNode, GraphLink } from "@/components/GraphView";
import { Sparkles, RefreshCw, Network } from "lucide-react";

export default function GraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState(true);

  const sampleNodes: GraphNode[] = [
    { id: "payments-api", label: "payments-api", group: "service", description: "Core billing microservice handling transactions." },
    { id: "DB_POOL_SIZE", label: "DB_POOL_SIZE", group: "config", val: 10, description: "Connection pool limit. Historically caused P1 outages when set > 15." },
    { id: "REQUEST_TIMEOUT", label: "REQUEST_TIMEOUT", group: "config", val: 8, description: "HTTP timeout duration in ms. Last modified by PR #402." },
    { id: "CACHE_TTL", label: "CACHE_TTL", group: "config", val: 6, description: "Redis session expiry duration." },
    { id: "INC-47", label: "INC-47: OOM Crash", group: "incident", val: 9, description: "P1 Outage: Database connections exhausted during peak sales." },
    { id: "INC-12", label: "INC-12: Gateway Timeout", group: "incident", val: 7, description: "P2 Outage: Upstream auth gateway dropped requests." },
    { id: "alex-dev", label: "alex-dev (Lead)", group: "author", val: 5, description: "Original author of DB_POOL_SIZE scaling logic." },
    { id: "sarah-sre", label: "sarah-sre (On-Call)", group: "author", val: 5, description: "Filed post-mortem for INC-47 and set pre-commit guardrail." },
    { id: "billing-service", label: "billing-service", group: "service", description: "Invoicing and recurring payment scheduler." },
    { id: "MAX_RETRIES", label: "MAX_RETRIES", group: "config", val: 8, description: "Retry loop limit for Stripe API webhooks." },
  ];

  const sampleLinks: GraphLink[] = [
    { source: "payments-api", target: "DB_POOL_SIZE" },
    { source: "payments-api", target: "REQUEST_TIMEOUT" },
    { source: "payments-api", target: "CACHE_TTL" },
    { source: "DB_POOL_SIZE", target: "INC-47" },
    { source: "REQUEST_TIMEOUT", target: "INC-12" },
    { source: "alex-dev", target: "DB_POOL_SIZE" },
    { source: "sarah-sre", target: "INC-47" },
    { source: "sarah-sre", target: "REQUEST_TIMEOUT" },
    { source: "billing-service", target: "MAX_RETRIES" },
    { source: "billing-service", target: "DB_POOL_SIZE" },
  ];

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8001/graph?service=payments-api");
      if (!res.ok) throw new Error("Graph API offline");
      const data = await res.json();
      if (data.nodes && data.nodes.length > 0) {
        setNodes(data.nodes);
        setLinks(data.links || []);
      } else {
        setNodes(sampleNodes);
        setLinks(sampleLinks);
      }
    } catch (err) {
      setNodes(sampleNodes);
      setLinks(sampleLinks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-400">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2a2a2a] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-[#f5a623]" />
            <span className="font-mono text-xs text-[#f5a623] uppercase tracking-wider font-semibold">
              // COGNEE KNOWLEDGE GRAPH
            </span>
          </div>
          <h1 className="font-bebas text-5xl md:text-[56px] text-[#f5a623] tracking-wide leading-none">
            EVIDENCE BOARD
          </h1>
          <p className="font-sans text-base text-[#9ca3af] mt-1 max-w-2xl">
            Every connection Capi has discovered. Config keys, incidents, engineers — all linked by red strings of provenance.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchGraphData}
          disabled={loading}
          className="self-start md:self-center px-5 py-2.5 bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#f5a623] rounded-lg font-mono text-xs text-[#f5f5f0] flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#f5a623] ${loading ? "animate-spin" : ""}`} />
          <span>REFRESH CORKBOARD</span>
        </button>
      </div>

      {/* GRAPH CONTAINER */}
      <GraphView nodes={nodes} links={links} />
    </div>
  );
}
