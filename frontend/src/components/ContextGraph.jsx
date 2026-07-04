import { useState } from 'react';
import { GitMerge, MessageSquare, AlertTriangle, FileCode, Share2, Info, FolderGit2 } from 'lucide-react';

export default function ContextGraph({ results, query, dangerScore, graphData }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('visual'); // visual or text

  // Use dynamic graphData from backend API, or fallback to simple query center node
  const nodes = graphData?.nodes || [
    { id: query || "CONFIG_KEY", label: query || "CONFIG_KEY", group: "config", danger: dangerScore?.level || "SAFE", desc: "Target configuration variable" }
  ];

  const links = graphData?.links || [];

  // Helper for node colors
  const getNodeColor = (node) => {
    if (node.group === "config") {
      if (node.danger === "DANGER") return "#ef4444";
      if (node.danger === "CAUTION") return "#eab308";
      return "#22c55e";
    }
    if (node.group === "incident") return "#ef4444";
    if (node.group === "commit" || node.group === "pr") return "#22c55e";
    if (node.group === "slack") return "#3b82f6";
    if (node.group === "file") return "#a855f7";
    return "#a1a1aa";
  };

  const getIconForGroup = (group) => {
    if (group === "incident") return <AlertTriangle size={16} color="#ef4444" />;
    if (group === "commit") return <FolderGit2 size={16} color="#22c55e" />;
    if (group === "pr") return <GitMerge size={16} color="#22c55e" />;
    if (group === "slack") return <MessageSquare size={16} color="#3b82f6" />;
    if (group === "file") return <FileCode size={16} color="#a855f7" />;
    return <Info size={16} color="#a1a1aa" />;
  };

  const getIconForContent = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('incident') || lower.includes('oom') || lower.includes('crash') || lower.includes('outage')) {
      return <AlertTriangle color="var(--danger)" />;
    }
    if (lower.includes('slack') || lower.includes('thread') || lower.includes('chat')) {
      return <MessageSquare color="var(--accent)" />;
    }
    if (lower.includes('pr #') || lower.includes('commit') || lower.includes('git')) {
      return <GitMerge color="var(--success)" />;
    }
    return <FileCode color="var(--text-secondary)" />;
  };

  // Dynamic circular layout math for N-1 orbiting nodes around center node[0]
  const orbitNodes = nodes.slice(1);
  const totalOrbit = orbitNodes.length;

  const calculatePosition = (idx) => {
    if (totalOrbit === 0) return { left: '50%', top: '50%' };
    // Start from -90 deg (top) and go clockwise
    const angle = -Math.PI / 2 + (2 * Math.PI * idx) / totalOrbit;
    const rx = 36; // horizontal radius percent
    const ry = 34; // vertical radius percent
    const left = 50 + rx * Math.cos(angle);
    const top = 50 + ry * Math.sin(angle);
    return { left: `${left}%`, top: `${top}%`, x: left, y: top };
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>
          Real-World Provenance for <span style={{ color: 'var(--accent)' }}>{query}</span>
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('visual')}
            style={{
              background: activeTab === 'visual' ? 'var(--accent)' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Share2 size={14} /> ECL Knowledge Graph ({nodes.length} Nodes)
          </button>
          <button
            onClick={() => setActiveTab('text')}
            style={{
              background: activeTab === 'text' ? 'var(--accent)' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Info size={14} /> Semantic Synthesis
          </button>
        </div>
      </div>

      {activeTab === 'visual' && (
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: '650px', height: '320px', position: 'relative', margin: '0 auto' }}>
            {/* SVG Connecting Lines for every dynamic link/orbit node */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {orbitNodes.map((node, idx) => {
                const pos = calculatePosition(idx);
                // Find matching link label if any
                const linkObj = links.find(l => l.target === node.id || l.source === node.id) || { label: "RELATED_TO" };
                const lineColor = getNodeColor(node);
                
                // Midpoint for label
                const midX = (50 + pos.x) / 2;
                const midY = (50 + pos.y) / 2;

                return (
                  <g key={`line-${idx}`}>
                    <line
                      x1="50%"
                      y1="50%"
                      x2={pos.left}
                      y2={pos.top}
                      stroke={lineColor}
                      strokeWidth="2"
                      strokeDasharray={node.group === "incident" ? "4 4" : "none"}
                      opacity="0.7"
                    />
                    <rect
                      x={`${midX - 8}%`}
                      y={`${midY - 3}%`}
                      width="16%"
                      height="6%"
                      fill="var(--bg-primary)"
                      rx="4"
                      opacity="0.8"
                    />
                    <text
                      x={`${midX}%`}
                      y={`${midY}%`}
                      fill={lineColor}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {linkObj.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center Node (Config Key) */}
            {nodes[0] && (
              <div
                onClick={() => setSelectedNode(nodes[0])}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: getNodeColor(nodes[0]),
                  color: '#fff',
                  padding: '0.8rem 1.4rem',
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  boxShadow: `0 0 25px ${getNodeColor(nodes[0])}`,
                  cursor: 'pointer',
                  zIndex: 10,
                  border: '2px solid #fff',
                  textAlign: 'center',
                  fontSize: '0.95rem',
                  maxWidth: '200px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                ⚙️ {nodes[0].label}
              </div>
            )}

            {/* Dynamically Orbiting Nodes */}
            {orbitNodes.map((node, idx) => {
              const pos = calculatePosition(idx);
              const color = getNodeColor(node);
              return (
                <div
                  key={node.id || idx}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(20, 20, 20, 0.85)',
                    border: `1.5px solid ${color}`,
                    color: '#ededed',
                    padding: '0.5rem 0.8rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: `0 4px 15px ${color}33`,
                    zIndex: 5,
                    maxWidth: '180px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'; }}
                >
                  {getIconForGroup(node.group)}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', width: '100%', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent)', fontSize: '0.85rem' }}>
            {selectedNode ? (
              <div>
                <strong style={{ color: 'var(--accent)' }}>Node Inspector [{selectedNode.group?.toUpperCase() || 'NODE'}]:</strong> {selectedNode.label}
                <p style={{ marginTop: '0.3rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedNode.desc}</p>
              </div>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>👆 Click any node in the interactive graph above to inspect its causal relationships, commit message, or author metadata.</span>
            )}
          </div>
        </div>
      )}

      {activeTab === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <Info size={24} color="var(--accent)" />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#ededed' }}>
              Cognee's <strong>Explainable Cognitive Layer (ECL)</strong> traversed real git commit diffs, GitHub pull requests, and post-mortems to synthesize this provenance report:
            </p>
          </div>

          {results.length === 0 ? (
            <p>No historical context found for this configuration key. Try using the Real-World Ingestion Hub above to scan your codebase!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.map((result, idx) => (
                <div key={idx} className="context-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '0.2rem' }}>
                    {getIconForContent(result)}
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{result}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
