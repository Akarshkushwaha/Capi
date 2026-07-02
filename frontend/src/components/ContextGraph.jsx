import { GitMerge, MessageSquare, AlertTriangle, FileCode } from 'lucide-react';

export default function ContextGraph({ results, query }) {
  
  // A helper function to assign icons based on text content (mock categorization)
  const getIconForContent = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('incident') || lower.includes('oom') || lower.includes('crash')) {
      return <AlertTriangle color="var(--danger)" />;
    }
    if (lower.includes('slack') || lower.includes('hey everyone')) {
      return <MessageSquare color="var(--accent)" />;
    }
    if (lower.includes('pr #') || lower.includes('commit')) {
      return <GitMerge color="var(--success)" />;
    }
    return <FileCode color="var(--text-secondary)" />;
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2>
        Context for <span style={{ color: 'var(--accent)' }}>{query}</span>
      </h2>
      
      {results.length === 0 ? (
        <p>No historical context found for this configuration key.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.map((result, idx) => (
            <div key={idx} className="context-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ marginTop: '0.2rem' }}>
                {getIconForContent(result)}
              </div>
              <div>
                <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem' }}>{result}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
