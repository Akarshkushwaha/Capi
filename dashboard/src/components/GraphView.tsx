"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCommit, GitPullRequest, AlertTriangle, ShieldAlert, Terminal, Activity, HelpCircle, Eye } from "lucide-react";

// Dynamically import ForceGraph2D with SSR disabled for Next.js App Router compatibility
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export interface GraphNode {
  id: string;
  label: string;
  group: "config" | "commit" | "pr" | "incident";
  val: number;
  status?: string;
  score?: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship?: string;
}

export interface GraphData {
  service: string;
  nodes: GraphNode[];
  links: GraphLink[];
}

interface GraphViewProps {
  serviceName: string;
}

export default function GraphView({ serviceName }: GraphViewProps) {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(550, window.innerHeight - 300)
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
        const res = await fetch(`${apiUrl}/graph?service=${encodeURIComponent(serviceName)}`);
        if (!res.ok) {
          throw new Error(`Failed to load graph: ${res.statusText}`);
        }
        const graphData = await res.json();
        setData(graphData);
      } catch (err: any) {
        setError(err.message || "Error connecting to Capi archaeology server.");
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, [serviceName]);

  const getNodeColor = (node: any) => {
    if (node.group === "incident") return "#ff003c"; // Neon Crimson
    if (node.group === "pr") return "#bf00ff";       // Electric Purple
    if (node.group === "commit") return "#64748b";   // Cyber Slate Gray
    if (node.group === "config") {
      if (node.status === "DANGER" || (node.score && node.score >= 40)) return "#ff003c";
      if (node.status === "CAUTION" || (node.score && node.score >= 20)) return "#ffaa00";
      if (node.status === "DEPRECATED") return "#475569";
      return "#00f0ff"; // Neon Cyan for safe config keys
    }
    return "#00f0ff";
  };

  return (
    <div className="space-y-6">
      {/* Educational Header for Gaming / Onboarding Feel */}
      <Card className="glass-panel border-[#00f0ff]/30 text-white">
        <CardHeader className="pb-3 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#00f0ff]" />
              <CardTitle className="text-xl font-mono tracking-wider uppercase">
                Interactive Knowledge Graph • <span className="text-[#00f0ff]">{serviceName}</span>
              </CardTitle>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <Badge className="bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50">🔵 Config Key</Badge>
              <Badge className="bg-slate-600/40 text-slate-300 border border-slate-500">⚪ Git Commit</Badge>
              <Badge className="bg-[#bf00ff]/20 text-[#d866ff] border border-[#bf00ff]/50">🟣 Pull Request</Badge>
              <Badge className="bg-[#ff003c]/20 text-[#ff003c] border border-[#ff003c]/50">🔴 Outage / P1 Incident</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3 text-xs text-slate-300 flex items-start space-x-2">
          <HelpCircle className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">What is this?</strong> This force-directed network graph maps every configuration variable in your microservice to the Git commits, Pull Requests, and production outage incident reports that modified or broke it. <strong className="text-[#00f0ff]">Click on any node below</strong> to inspect its archaeology provenance.
          </p>
        </CardContent>
      </Card>

      {/* Main Canvas & Details Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas */}
        <div 
          ref={containerRef} 
          className="lg:col-span-3 glass-panel rounded-xl overflow-hidden relative border border-[#00f0ff]/20 min-h-[550px] flex items-center justify-center bg-[#07070a]"
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07070a]/80 z-10 space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#00f0ff] border-t-transparent animate-spin" />
              <span className="text-xs font-mono tracking-widest text-[#00f0ff]">GENERATING FORCE GRAPH...</span>
            </div>
          )}

          {error && (
            <div className="text-center p-6 text-[#ff003c] font-mono">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#ff003c]" />
              <p className="font-bold">Failed to load graph</p>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
          )}

          {data && !loading && (
            <ForceGraph2D
              width={dimensions.width}
              height={dimensions.height}
              graphData={data}
              nodeLabel="label"
              nodeColor={getNodeColor}
              nodeRelSize={6}
              linkColor={() => "rgba(0, 240, 255, 0.25)"}
              linkWidth={1.5}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              onNodeClick={(node: any) => setSelectedNode(node)}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.id;
                const fontSize = 12 / globalScale;
                ctx.font = `${node.group === "config" ? "bold " : ""}${fontSize}px monospace`;
                
                // Draw circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val ? node.val / 2 : 5, 0, 2 * Math.PI, false);
                ctx.fillStyle = getNodeColor(node);
                ctx.fill();
                
                if (node === selectedNode) {
                  ctx.lineWidth = 2 / globalScale;
                  ctx.strokeStyle = "#ffffff";
                  ctx.stroke();
                }

                // Draw label text
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = node.group === "config" ? "#ffffff" : "#a1a1aa";
                ctx.fillText(label, node.x, node.y + (node.val ? node.val / 2 : 5) + fontSize);
              }}
            />
          )}
        </div>

        {/* Node Inspection Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-panel text-white border-[#00f0ff]/20 h-full flex flex-col justify-between">
            <CardHeader className="border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#00f0ff] uppercase tracking-wider">
                <Eye className="w-4 h-4" />
                <span>Node Inspector</span>
              </div>
              <CardTitle className="text-lg font-mono tracking-tight text-white mt-1">
                {selectedNode ? selectedNode.id : "Select a Node"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4 flex-1 space-y-4 font-mono text-xs">
              {selectedNode ? (
                <>
                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase text-[10px]">Type / Group</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 uppercase">
                        {selectedNode.group}
                      </Badge>
                      {selectedNode.status && (
                        <Badge className={`uppercase ${selectedNode.status === "DANGER" ? "bg-[#ff003c]/20 text-[#ff003c] border border-[#ff003c]" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/40"}`}>
                          {selectedNode.status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {selectedNode.score !== undefined && (
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[10px]">Danger Meter</span>
                      <div className={`text-xl font-black ${selectedNode.score >= 40 ? "text-[#ff003c]" : "text-[#00f0ff]"}`}>
                        {selectedNode.score} / 100
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase text-[10px]">Archaeology Details</span>
                    <div className="p-3 bg-black/50 rounded border border-white/10 text-slate-200 leading-relaxed break-words font-sans text-xs">
                      {selectedNode.label}
                    </div>
                  </div>

                  <div className="p-3 bg-[#00f0ff]/10 rounded border border-[#00f0ff]/30 text-[11px] text-[#00f0ff]">
                    💡 <strong>Tip:</strong> You can drag nodes to rearrange the network graph or scroll to zoom in/out.
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <Activity className="w-8 h-8 text-slate-600 animate-pulse" />
                  <p>Click any node on the graph canvas to unearth its full Git blame and outage history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
