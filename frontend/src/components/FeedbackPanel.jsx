import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function FeedbackPanel({ query }) {
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const submitFeedback = async (isCorrect) => {
    setStatus('submitting');
    try {
      const response = await fetch('http://localhost:8000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          suggested: query,
          actual: query,
          correct: isCorrect
        })
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="glass-panel" style={{ height: 'fit-content' }}>
      <h2>Provide Feedback</h2>
      <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Did changing <strong style={{ color: 'var(--text-primary)' }}>{query}</strong> cause an incident, or was it a safe deploy?
      </p>

      {status === 'success' && (
        <div style={{ color: 'var(--success)', marginBottom: '1rem', fontWeight: 500 }}>
          Feedback recorded! Memory graph updated.
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: 500 }}>
          Failed to record feedback. Check connection.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          className="btn btn-success" 
          onClick={() => submitFeedback(true)}
          disabled={status === 'submitting'}
        >
          <ShieldCheck size={20} />
          Safe Deploy (Decrease Danger)
        </button>
        
        <button 
          className="btn btn-danger" 
          onClick={() => submitFeedback(false)}
          disabled={status === 'submitting'}
        >
          <ShieldAlert size={20} />
          Caused Incident (Increase Danger)
        </button>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>Self-Improving AI</h3>
        <p style={{ fontSize: '0.85rem' }}>
          This feedback triggers Cognee's <code>improve()</code> method, which re-weights the knowledge graph edges. If a config causes incidents, its "danger score" increases.
        </p>
      </div>
    </div>
  );
}
