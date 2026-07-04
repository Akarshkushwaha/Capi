import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ContextGraph from './components/ContextGraph';
import FeedbackPanel from './components/FeedbackPanel';
import IngestHub from './components/IngestHub';
import { Database, Zap, Shield, AlertTriangle, CheckCircle, Info, UploadCloud, ChevronDown, ChevronUp } from 'lucide-react';
import './index.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [dangerScore, setDangerScore] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [demoStatus, setDemoStatus] = useState('');
  const [showIngestHub, setShowIngestHub] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setLoading(true);
    setHasSearched(true);
    setDangerScore(null);
    setGraphData(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/query?key=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.recall || []);
        setDangerScore(data.danger_score || null);
        setGraphData(data.graph_data || null);
      } else {
        setResults(["Error: Could not connect to Cognee backend. Make sure the FastAPI server is running."]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([
        "Error: Could not connect to backend. Please ensure FastAPI is running on port 8000.",
        `Mock offline fallback: ${searchQuery} was modified after Incident INC-47.`
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setDemoStatus('seeding');
    try {
      const res = await fetch('http://localhost:8000/api/demo', { method: 'POST' });
      if (res.ok) {
        setDemoStatus('success');
        handleSearch('DB_POOL_SIZE');
      } else {
        setDemoStatus('error');
      }
    } catch (err) {
      setDemoStatus('error');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <Database size={42} color="var(--accent)" />
          <h1 className="header-title">Capi Archaeology</h1>
        </div>
        <p>Why is this config value 10 and not 20? Get full provenance, root cause analysis, and danger guardrails.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleSeedDemo} 
            disabled={demoStatus === 'seeding'}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '50px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            <Zap size={16} /> {demoStatus === 'seeding' ? 'Seeding Knowledge Graph...' : '⚡ One-Click E-Commerce Outage Demo'}
          </button>

          <button 
            onClick={() => setShowIngestHub(!showIngestHub)}
            style={{
              background: showIngestHub ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.1)',
              border: '1px solid #a855f7',
              color: '#fff',
              padding: '0.6rem 1.2rem',
              borderRadius: '50px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <UploadCloud size={16} color="#a855f7" />
            📥 Connect Real Codebase & Logs
            {showIngestHub ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '0.6rem 1.2rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)'
          }}>
            <Shield size={16} color="var(--success)" /> CLI Hook: <code>capi install-hook</code>
          </div>
        </div>
      </header>

      <main>
        {/* Real-World Ingestion Hub Accordion */}
        {showIngestHub && (
          <IngestHub onIngestSuccess={() => {
            if (query) handleSearch(query);
            else handleSearch('PORT');
          }} />
        )}

        <SearchBar onSearch={handleSearch} isLoading={loading} />
        
        {loading && <div className="loading-spinner"></div>}
        
        {!loading && hasSearched && (
          <div>
            {/* Danger Score Guardrail Banner */}
            {dangerScore && (
              <div className="glass-panel" style={{
                marginBottom: '1.5rem',
                borderLeft: `6px solid ${dangerScore.level === 'DANGER' ? '#ef4444' : dangerScore.level === 'CAUTION' ? '#eab308' : '#22c55e'}`,
                background: dangerScore.level === 'DANGER' ? 'rgba(239, 68, 68, 0.08)' : dangerScore.level === 'CAUTION' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(34, 197, 94, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {dangerScore.level === 'DANGER' && <AlertTriangle size={32} color="#ef4444" />}
                    {dangerScore.level === 'CAUTION' && <Info size={32} color="#eab308" />}
                    {dangerScore.level === 'SAFE' && <CheckCircle size={32} color="#22c55e" />}
                    <div>
                      <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#fff' }}>
                        Risk Assessment: <span style={{ color: dangerScore.level === 'DANGER' ? '#ef4444' : dangerScore.level === 'CAUTION' ? '#eab308' : '#22c55e' }}>{dangerScore.level} ({dangerScore.score}/100)</span>
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '0.2rem' }}>
                        {dangerScore.safe_range}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>🔴 Incidents Linked: <strong style={{ color: '#fff' }}>{dangerScore.incidents_count}</strong></span>
                    <span>🟢 Safe Deploys: <strong style={{ color: '#fff' }}>{dangerScore.safe_deploys_count}</strong></span>
                  </div>
                </div>

                {dangerScore.reasons && dangerScore.reasons.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                      {dangerScore.reasons.map((r, i) => (
                        <li key={i} style={{ marginBottom: '0.3rem' }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="results-grid">
              <ContextGraph results={results} query={query} dangerScore={dangerScore} graphData={graphData} />
              <FeedbackPanel query={query} />
            </div>
          </div>
        )}

        {!hasSearched && !loading && (
           <div style={{textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.08)'}}>
              <h3 style={{fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem'}}>How to use Capi in your workflow:</h3>
              <p style={{maxWidth: '650px', margin: '0 auto 1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)'}}>
                Click <strong>📥 Connect Real Codebase & Logs</strong> above to scan your local Git commits and pull requests, or click <strong>⚡ One-Click Demo</strong> to load our simulated e-commerce outage graph.
              </p>
              
              <div style={{display: 'flex', justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap'}}>
                {['DB_POOL_SIZE', 'PORT', 'LLM_MODEL', 'TIMEOUT'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSearch(key)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-primary)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    🔍 {key}
                  </button>
                ))}
              </div>
           </div>
        )}
      </main>
    </div>
  );
}

export default App;
