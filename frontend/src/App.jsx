import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ContextGraph from './components/ContextGraph';
import FeedbackPanel from './components/FeedbackPanel';
import { Database } from 'lucide-react';
import './index.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setLoading(true);
    setHasSearched(true);
    
    try {
      // In a real app, this would call our backend
      // For now we'll call the actual backend API if it's running
      const response = await fetch(`http://localhost:8000/api/query?key=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.data || []);
      } else {
        // Fallback or error handling
        setResults(["Error: Could not connect to Cognee backend. Make sure the FastAPI server is running."]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([
        "Error: Could not connect to backend. Please ensure FastAPI is running on port 8000.",
        `Mock local result for ${searchQuery}: DB_POOL_SIZE was set to 10 on March 14, 2024 after INC-47.`
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestMock = async () => {
    try {
      await fetch('http://localhost:8000/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: "Mock data ingested via button.",
          dataset_name: "config_archaeology_mock"
        })
      });
      alert('Mock data triggered ingestion.');
    } catch (err) {
      alert('Failed to connect to backend.');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <Database size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
        <h1 className="header-title">Config Archaeology</h1>
        <p>Why is this value 10 and not 20? Discover the hidden context of your codebase.</p>
      </header>

      <main>
        <SearchBar onSearch={handleSearch} isLoading={loading} />
        
        {loading && <div className="loading-spinner"></div>}
        
        {!loading && hasSearched && (
          <div className="results-grid">
            <ContextGraph results={results} query={query} />
            <FeedbackPanel query={query} />
          </div>
        )}

        {!hasSearched && !loading && (
           <div style={{textAlign: 'center', marginTop: '3rem'}}>
              <p>Try searching for configuration keys like "DB_POOL_SIZE" or "REQUEST_TIMEOUT"</p>
              <button className="btn" style={{margin: '2rem auto', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)'}} onClick={handleIngestMock}>
                Initialize Mock Data
              </button>
           </div>
        )}
      </main>
    </div>
  );
}

export default App;
