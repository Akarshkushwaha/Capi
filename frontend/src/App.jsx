import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ContextGraph from './components/ContextGraph';
import FeedbackPanel from './components/FeedbackPanel';
import IngestHub from './components/IngestHub';
import { Database, Zap, Shield, AlertTriangle, CheckCircle, Info, UploadCloud, ChevronDown, ChevronUp, Trophy, Play, CheckCircle2 } from 'lucide-react';
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

  // Gamified quest line states
  const [currentStep, setCurrentStep] = useState(1);
  const [scannedVars, setScannedVars] = useState(["PORT", "LLM_PROVIDER", "LLM_MODEL", "COGNEE_API_URL"]);

  // Fetch real variables dynamically from the codebase
  useEffect(() => {
    const fetchVars = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/variables');
        if (res.ok) {
          const data = await res.json();
          if (data.variables && data.variables.length > 0) {
            setScannedVars(data.variables);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic variables:", err);
      }
    };
    fetchVars();
  }, []);

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
        // Advance onboarding quest to final step when search happens
        if (currentStep === 2) {
          setCurrentStep(3);
        }
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
        setCurrentStep(2); // Advance quest to Step 2
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
              background: 'linear-gradient(135deg, #d4af37 0%, #aa841c 100%)',
              color: '#070708',
              border: 'none',
              padding: '0.6rem 1.4rem',
              borderRadius: '50px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            <Zap size={16} fill="#070708" /> {demoStatus === 'seeding' ? 'Rolling the Dice...' : '🎰 One-Click E-Commerce Outage Demo'}
          </button>

          <button 
            onClick={() => setShowIngestHub(!showIngestHub)}
            style={{
              background: showIngestHub ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.05)',
              border: '1px solid #d4af37',
              color: '#fff',
              padding: '0.6rem 1.4rem',
              borderRadius: '50px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <UploadCloud size={16} color="#d4af37" />
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
          <IngestHub onIngestSuccess={async () => {
            // Re-fetch variables list dynamically on upload success
            try {
              const res = await fetch('http://localhost:8000/api/variables');
              if (res.ok) {
                const data = await res.json();
                if (data.variables && data.variables.length > 0) setScannedVars(data.variables);
              }
            } catch (e) {}
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
                borderLeft: `6px solid ${dangerScore.level === 'DANGER' ? '#ff007f' : dangerScore.level === 'CAUTION' ? '#eab308' : '#39ff14'}`,
                background: dangerScore.level === 'DANGER' ? 'rgba(255, 0, 127, 0.08)' : dangerScore.level === 'CAUTION' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(57, 255, 20, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {dangerScore.level === 'DANGER' && <AlertTriangle size={32} color="#ff007f" />}
                    {dangerScore.level === 'CAUTION' && <Info size={32} color="#eab308" />}
                    {dangerScore.level === 'SAFE' && <CheckCircle size={32} color="#39ff14" />}
                    <div>
                      <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#fff' }}>
                        Risk Assessment: <span style={{ color: dangerScore.level === 'DANGER' ? '#ff007f' : dangerScore.level === 'CAUTION' ? '#eab308' : '#39ff14' }}>{dangerScore.level} ({dangerScore.score}/100)</span>
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
           <div className="glass-panel" style={{
             marginTop: '2rem', 
             padding: '2.5rem', 
             textAlign: 'center', 
             border: '1px solid rgba(212, 175, 55, 0.25)',
             boxShadow: '0 8px 32px rgba(212, 175, 55, 0.08)'
           }}>
              <h2 style={{ fontFamily: 'Cinzel', fontSize: '2rem', color: 'var(--accent)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem' }}>
                <Trophy color="var(--accent)" size={28} /> Configuration Archaeology Quest
              </h2>
              <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Complete this 3-step quick onboarding tutorial to unlock full provenance insights from your repository.
              </p>

              {/* Dynamic Game Steps Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem', position: 'relative', flexWrap: 'wrap' }}>
                {[1, 2, 3].map((step) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
                    <span style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: currentStep >= step ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                      color: currentStep >= step ? '#000' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      boxShadow: currentStep === step ? '0 0 15px var(--accent)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {currentStep > step ? '✓' : step}
                    </span>
                    <span style={{
                      fontWeight: currentStep === step ? 700 : 400,
                      color: currentStep === step ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      {step === 1 ? 'Unlock Database' : step === 2 ? 'Investigate Code' : 'Secure Staging'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Game Level Cards */}
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '2rem', textAlign: 'left', maxWidth: '750px', margin: '0 auto' }}>
                {currentStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Play size={18} fill="var(--accent)" color="var(--accent)" /> Quest Level 1: Unlock Knowledge Memory
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                      Start your quest by seeding Cognee's vector-relational knowledge database. This initializes the e-commerce incident memory and establishes outage scores.
                    </p>
                    <button
                      onClick={handleSeedDemo}
                      disabled={demoStatus === 'seeding'}
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #aa841c 100%)',
                        color: '#070708',
                        border: 'none',
                        padding: '0.8rem 1.6rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {demoStatus === 'seeding' ? 'Syncing...' : '🔑 Seed Simulated Incidents'}
                    </button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Play size={18} fill="var(--accent)" color="var(--accent)" /> Quest Level 2: Investigate Active Codebase
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                      Great! Memory initialized. Now, pick one of the **real, dynamically detected configuration keys** scanned from your local git commits below to trace its ownership and causations:
                    </p>

                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                      {scannedVars.map((v) => (
                        <button
                          key={v}
                          onClick={() => handleSearch(v)}
                          style={{
                            background: 'rgba(212, 175, 55, 0.08)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            color: '#fff',
                            padding: '0.5rem 1.2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          🔍 {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={20} color="var(--success)" /> Quest Level 3: Secure Staging Hook
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                      You've unlocked the graph! The final level is to protect your staging pipeline. Run this command inside your local project terminal to deploy the autonomous pre-commit guardrail hook:
                    </p>
                    <div style={{
                      background: '#000',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      padding: '1rem',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.95rem',
                      color: 'var(--accent)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>capi install-hook</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Copy & Run in Terminal</span>
                    </div>
                  </div>
                )}
              </div>
           </div>
        )}
      </main>
    </div>
  );
}

export default App;
