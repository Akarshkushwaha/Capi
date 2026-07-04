"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ZoomIn, ZoomOut, RotateCcw, ShieldAlert, User, Key, X, ArrowRight } from "lucide-react";

// Dynamically import react-force-graph-2d with SSR disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-[#1a1a1a] cork-texture rounded-2xl flex items-center justify-center font-mono text-[#f5a623] border border-[#2a2a2a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
        <span>PINNING EVIDENCE ON CORKBOARD...</span>
      </div>
    </div>
  ),
});

export interface GraphNode {
  id: string;
  label: string;
  group: "config" | "incident" | "author" | "service";
  val?: number;
  description?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
}

interface GraphViewProps {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function GraphView({ nodes, links }: GraphViewProps) {
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 600,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
  };

  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.3, 400);
  };

  const handleReset = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 40);
    }
  };

  // Node Colors: Config Key = Amber (#f5a623), Incident = Red (#dc2626), Engineer = Blue (#3b82f6)
  const getNodeColor = (group: string, isHovered: boolean) => {
    switch (group) {
      case "config":
        return isHovered ? "#fbbf24" : "#f5a623";
      case "incident":
        return isHovered ? "#ef4444" : "#dc2626";
      case "author":
      case "engineer":
        return isHovered ? "#60a5fa" : "#3b82f6";
      default:
        return "#9ca3af";
    }
  };

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHovered = hoveredNode?.id === node.id || selectedNode?.id === node.id;
    const size = node.group === "config" ? 8 : node.group === "incident" ? 7 : 5;
    const color = getNodeColor(node.group, isHovered);
    const x = node.x || 0;
    const y = node.y || 0;

    // Glow effect
    if (isHovered || node.group === "incident") {
      ctx.beginPath();
      ctx.arc(x, y, size + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.group === "incident" ? "rgba(220, 38, 38, 0.3)" : "rgba(245, 166, 35, 0.3)";
      ctx.fill();
    }

    // Node Circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.strokeStyle = isHovered ? "#ffffff" : "#111111";
    ctx.stroke();

    // Node Text Label in JetBrains Mono
    const label = node.label || node.id;
    const fontSize = Math.max(10 / globalScale, 3.5);
    ctx.font = `${node.group === "config" ? "bold " : ""}${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = isHovered ? "#ffffff" : "#f5f5f0";
    ctx.fillText(label, x, y + size + 2);
  }, [hoveredNode, selectedNode]);

  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const isConnected = hoveredNode && (
      (typeof link.source === "object" ? link.source.id : link.source) === hoveredNode.id ||
      (typeof link.target === "object" ? link.target.id : link.target) === hoveredNode.id
    );
    const start = link.source;
    const end = link.target;
    if (!start || !end || typeof start !== "object" || typeof end !== "object") return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = isConnected ? "rgba(245, 166, 35, 0.85)" : "rgba(245, 166, 35, 0.4)";
    ctx.lineWidth = isConnected ? 2 : 1.2;
    ctx.stroke();
  }, [hoveredNode]);

  return (
    <div ref={containerRef} className="w-full relative bg-[#1a1a1a] cork-texture rounded-2xl border border-[#2a2a2a] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={{ nodes, links }}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        onNodeClick={(node: any) => setSelectedNode(node)}
        onNodeHover={(node: any) => setHoveredNode(node || null)}
        cooldownTicks={100}
        onEngineStop={() => {
          if (fgRef.current) fgRef.current.zoomToFit(400, 60);
        }}
      />

      {/* FLOATING CONTROLS (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-10 h-10 bg-[#111111]/90 border border-[#f5a623]/40 hover:border-[#f5a623] rounded-lg text-[#f5a623] flex items-center justify-center transition-all hover:scale-105 shadow-lg"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-10 h-10 bg-[#111111]/90 border border-[#f5a623]/40 hover:border-[#f5a623] rounded-lg text-[#f5a623] flex items-center justify-center transition-all hover:scale-105 shadow-lg"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-10 h-10 bg-[#111111]/90 border border-[#f5a623]/40 hover:border-[#f5a623] rounded-lg text-[#f5a623] flex items-center justify-center transition-all hover:scale-105 shadow-lg"
          title="Reset View (⌂)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* LEGEND (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#111111]/95 border border-[#2a2a2a] rounded-lg p-3 shadow-xl font-mono text-xs text-[#f5f5f0] space-y-2">
        <div className="text-[10px] text-[#f5a623] uppercase font-bold tracking-wider mb-1">
          // CORKBOARD LEGEND
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#f5a623] shadow-[0_0_8px_rgba(245,166,35,0.8)]" />
          <span>Config Key (Suspect)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#dc2626] animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
          <span>Incident (Prior Offense)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span>Engineer (Witness/Author)</span>
        </div>
      </div>

      {/* NODE DETAIL SIDE PANEL (Slides in on click) */}
      {selectedNode && (
        <div className="absolute top-0 right-0 z-30 w-full sm:w-80 h-full bg-[#111111]/95 backdrop-blur-xl border-l border-[#2a2a2a] p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#f5a623]">
                // PINNED EVIDENCE DETAIL
              </span>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-[#9ca3af] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {selectedNode.group === "config" && <Key className="w-4 h-4 text-[#f5a623]" />}
                {selectedNode.group === "incident" && <ShieldAlert className="w-4 h-4 text-[#dc2626]" />}
                {selectedNode.group === "author" && <User className="w-4 h-4 text-[#3b82f6]" />}
                <span className="font-mono text-xs text-[#9ca3af] uppercase">
                  TYPE: {selectedNode.group}
                </span>
              </div>
              <h3 className="font-bebas text-3xl text-white tracking-wide">
                {selectedNode.label || selectedNode.id}
              </h3>
            </div>

            <div className="evidence-border pl-3 py-1 text-sm font-sans text-[#f5f5f0] bg-[#1a1a1a]/60 rounded-r p-3">
              {selectedNode.description ||
                `Entity pinned from Cognee hybrid memory graph. Connected to historical commits and incident reports in Capi.`}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="w-full py-2.5 bg-[#f5a623] hover:bg-[#fbbf24] text-[#0a0a0a] font-bebas text-xl tracking-wider rounded transition-all"
            >
              CLOSE CASE FILE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
