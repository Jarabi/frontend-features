import { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE = 'https://jsonplaceholder.typicode.com/posts';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);
  
  // Refs for debounce and request cancellation
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Function to highlight matched text
  const highlightMatch = (text, search) => {
    if (!search.trim()) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    console.log('REGEX:', regex);
    console.log('PARTS:', parts);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
        <mark key={i} className="highlight">{part}</mark> : 
        part
    );
  };

  // Search function with request cancellation
  const performSearch = async (query) => {
    // Don't search if query is empty
    if (!query.trim()) {
      setResults([]);
      setNoResults(false);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);
    setNoResults(false);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `${API_BASE}?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      
      if (data.length === 0) {
        setNoResults(true);
        setResults([]);
      } else {
        setNoResults(false);
        setResults(data);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce delay
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="app">
      <header>
        <h1>🔍 Debounced Search</h1>
        <p>Search posts with debouncing, request cancellation & highlight matching text</p>
      </header>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for posts... (e.g., 'quis', 'vero', 'magni')"
            className="search-input"
            autoFocus
          />
          {loading && (
            <div className="search-spinner">
              <div className="spinner-small"></div>
            </div>
          )}
        </div>
        
        <div className="search-stats">
          {searchTerm && !loading && !error && (
            <span className="result-count">
              Found {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      <div className="results-container">
        {/* Loading skeleton */}
        {loading && (
          <div className="skeleton-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-item">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button onClick={() => performSearch(searchTerm)} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* No results */}
        {noResults && !loading && searchTerm && (
          <div className="no-results">
            <p>😕 No results found for "{searchTerm}"</p>
            <p className="suggestion">Try different keywords like "quis", "vero", or "magni"</p>
          </div>
        )}

        {/* Results with highlighting */}
        {!loading && !error && results.length > 0 && (
          <div className="results-list">
            {results.map(result => (
              <article key={result.id} className="result-card">
                <h3>{highlightMatch(result.title, searchTerm)}</h3>
                <p>{highlightMatch(result.body, searchTerm)}</p>
                <small>Post #{result.id}</small>
              </article>
            ))}
          </div>
        )}

        {/* Empty initial state */}
        {!searchTerm && !loading && !error && (
          <div className="empty-state">
            <p>✨ Start typing to search posts</p>
            <p className="example">Try: "quis", "vero", "magni"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;