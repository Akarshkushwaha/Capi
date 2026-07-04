import { useState } from 'react';
import { FolderGit2, GitPullRequest, AlertOctagon, CheckCircle2, Loader2, UploadCloud, HelpCircle } from 'lucide-react';

export default function IngestHub({ onIngestSuccess }) {
  const [activeTab, setActiveTab] = useState('git');
  const [gitPath, setGitPath] = useState('/home/akarsh/Capi');
  const [githubRepo, setGithubRepo] = useState('fastapi/fastapi');
  const [customLog, setCustomLog] = useState("INCIDENT REPORT INC-99:\nRoot cause: TIMEOUT setting was lowered to 5s, causing API worker threads to timeout under high concurrency.\nResolution: Increased TIMEOUT to 30s.");
  
  const [status, setStatus] = useState({ loading: false, msg: '', error: '' });

  const handleIngestGit = async () => {
    setStatus({ loading: true, msg: `Scanning Git commit history in '${gitPath}'...`, error: '' });
    try {
      const res = await fetch('http://localhost:8000/api/ingest/git', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_path: gitPath, max_commits: 20 })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, msg: data.message || 'Git commit history successfully ingested into Cognee graph!', error: '' });
        if (onIngestSuccess) onIngestSuccess();
      } else {
        setStatus({ loading: false, msg: '', error: data.detail || 'Failed to scan repository.' });
      }
    } catch (err) {
      setStatus({ loading: false, msg: '', error: 'Could not connect to FastAPI server on port 8000.' });
    }
  };

  const handleIngestPRs = async () => {
    setStatus({ loading: true, msg: `Fetching GitHub PR discussions for '${githubRepo}'...`, error: '' });
    try {
      const res = await fetch('http://localhost:8000/api/ingest/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_name: githubRepo, limit: 5 })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, msg: data.message || 'GitHub PR discussions ingested into Cognee graph!', error: '' });
        if (onIngestSuccess) onIngestSuccess();
      } else {
        setStatus({ loading: false, msg: 'Failed to fetch PRs.' });
      }
    } catch (err) {
      setStatus({ loading: false, msg: '', error: 'Could not connect to backend.' });
    }
  };

  const handleIngestCustom = async () => {
    setStatus({ loading: true, msg: 'Ingesting outage report into Cognee causal graph...', error: '' });
    try {
      const res = await fetch('http://localhost:8000/api/ingest/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: customLog, dataset_name: 'incidents' })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, msg: data.message || 'Outage report ingested!', error: '' });
        if (onIngestSuccess) onIngestSuccess();
      } else {
        setStatus({ loading: false, msg: '', error: 'Failed to ingest report.' });
      }
    } catch (err) {
      setStatus({ loading: false, msg: '', error: 'Could not connect to backend.' });
    }
  };

  return (
    <div className="glass-panel" style={{
      marginBottom: '2rem',
      background: 'rgba(20, 20, 30, 0.65)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <UploadCloud size={24} color="#a855f7" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Real-World Archaeology Ingestion Hub</h3>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
        Connect Capi to your actual Git repositories, GitHub PRs, or incident logs so your team can query real production provenance.
      </p>

      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setActiveTab('git'); setStatus({ loading: false, msg: '', error: '' }); }}
          style={{
            background: activeTab === 'git' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            border: activeTab === 'git' ? '1px solid #a855f7' : '1px solid transparent',
            color: activeTab === 'git' ? '#fff' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <FolderGit2 size={16} /> 1. Scan Local Git Repo
        </button>
        <button
          onClick={() => { setActiveTab('pr'); setStatus({ loading: false, msg: '', error: '' }); }}
          style={{
            background: activeTab === 'pr' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            border: activeTab === 'pr' ? '1px solid #a855f7' : '1px solid transparent',
            color: activeTab === 'pr' ? '#fff' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <GitPullRequest size={16} /> 2. Fetch GitHub PRs
        </button>
        <button
          onClick={() => { setActiveTab('custom'); setStatus({ loading: false, msg: '', error: '' }); }}
          style={{
            background: activeTab === 'custom' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            border: activeTab === 'custom' ? '1px solid #a855f7' : '1px solid transparent',
            color: activeTab === 'custom' ? '#fff' : 'var(--text-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <AlertOctagon size={16} /> 3. Ingest Outage Report
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'git' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#c084fc', alignItems: 'flex-start' }}>
            <HelpCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>How it works:</strong> Ingests the commit logs of your local repository. Capi automatically scans the commit history (e.g. up to 20 commits), extracts configuration file edits (`.env`, `.yaml`, `.json`), parses file additions/removals, and links them into the Cognee relational database.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem', fontWeight: 500 }}>
                Absolute Local Git Directory Path:
              </label>
              <input
                type="text"
                value={gitPath}
                onChange={(e) => setGitPath(e.target.value)}
                placeholder="e.g. /home/akarsh/Capi or /Users/username/my-web-app"
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <button
              onClick={handleIngestGit}
              disabled={status.loading}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: status.loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
                height: '46px'
              }}
            >
              {status.loading ? <Loader2 size={18} className="spin" /> : <FolderGit2 size={18} />}
              {status.loading ? 'Scanning & Ingesting...' : 'Scan Git Commits'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'pr' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#c084fc', alignItems: 'flex-start' }}>
            <HelpCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>How it works:</strong> Fetches open or merged Pull Requests from the GitHub API. It parses discussion descriptions, comment text, and lists of modified config files to index key conversations and team review agreements into the Cognee graph.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem', fontWeight: 500 }}>
                GitHub Repository:
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="e.g. owner/repository_name (e.g., fastapi/fastapi)"
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <button
              onClick={handleIngestPRs}
              disabled={status.loading}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: status.loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
                height: '46px'
              }}
            >
              {status.loading ? <Loader2 size={18} className="spin" /> : <GitPullRequest size={18} />}
              {status.loading ? 'Fetching PRs...' : 'Ingest PR Discussions'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#c084fc', alignItems: 'flex-start' }}>
            <HelpCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>How it works:</strong> Directly uploads outage post-mortems, system crashes, or Slack channel emergency thread exports. Capi's AI parses mentions of variables (e.g., `TIMEOUT`, `PORT`, `DB_POOL_SIZE`) and creates direct danger nodes in the SQLite feedback engine.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem', fontWeight: 500 }}>
              Paste Incident Post-Mortem, Slack Export, or Custom Warning Note:
            </label>
            <textarea
              value={customLog}
              onChange={(e) => setCustomLog(e.target.value)}
              rows={5}
              placeholder="e.g. INCIDENT REPORT INC-99: DB_POOL_SIZE was set to 40. This exhausted system connections during high traffic and crashed the payment API."
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'monospace',
                marginBottom: '1rem',
                lineHeight: '1.4'
              }}
            />
            <button
              onClick={handleIngestCustom}
              disabled={status.loading}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: status.loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
              }}
            >
              {status.loading ? <Loader2 size={18} className="spin" /> : <AlertOctagon size={18} />}
              {status.loading ? 'Ingesting Report...' : 'Ingest Report into Graph'}
            </button>
          </div>
        </div>
      )}

      {/* Status Notifications */}
      {status.msg && (
        <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} /> {status.msg}
        </div>
      )}
      {status.error && (
        <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.9rem' }}>
          ❌ {status.error}
        </div>
      )}
    </div>
  );
}
