import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_BASE = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_SIZE = 10;

function App() {
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [noResults, setNoResults] = useState(false);

    // Infinite scroll state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalLoaded, setTotalLoaded] = useState(0);

    // Cache structure: { "query:page": data[] }
    const [cache, setCache] = useState({});

    // Refs
    const inputRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);
    const observerRef = useRef(null);
    const lastItemRef = useRef(null);

    // Track if we're in search mode vs initial load
    const [isSearching, setIsSearching] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');

    // Function to highlight matched text
    const highlightMatch = (text, search) => {
        if (!search.trim()) return text;

        const regex = new RegExp(
            `(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
            'gi',
        );
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className='highlight'>
                    {part}
                </mark>
            ) : (
                part
            ),
        );
    };

    // Generate cache key
    const getCacheKey = (query, pageNum) => {
        return query ? `${query}:${pageNum}` : `initial:${pageNum}`;
    };

    // Keep a ref in sync with cache state for reads without dependency
    const cacheRef = useRef(cache);
    useEffect(() => {
        cacheRef.current = cache;
    }, [cache]);

    // Search/Pagination function
    const fetchContent = useCallback(
        async (query, pageNum, isNewSearch = false) => {
            const cacheKey = getCacheKey(query, pageNum);

            // Check cache first
            const cachedData = cacheRef.current[cacheKey];
            if (cachedData) {
                if (isNewSearch) {
                    setResults(cachedData);
                    setTotalLoaded(cachedData.length);
                } else {
                    setResults((prev) => [...prev, ...cachedData]);
                    setTotalLoaded((prev) => prev + cachedData.length);
                }
                if (cachedData.length < PAGE_SIZE) {
                    setHasMore(false);
                }
                return;
            }

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            setLoading(true);
            setError(null);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                let url;
                if (query.trim()) {
                    // Search with pagination
                    url = `${API_BASE}?q=${encodeURIComponent(query)}&_page=${pageNum}&_limit=${PAGE_SIZE}`;
                } else {
                    // Regular posts with pagination
                    url = `${API_BASE}?_page=${pageNum}&_limit=${PAGE_SIZE}`;
                }

                const response = await fetch(url, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error('Failed to fetch');

                const data = await response.json();

                // Update cache
                setCache((prev) => ({ ...prev, [cacheKey]: data }));

                // Update results
                if (isNewSearch) {
                    setResults(data);
                    setTotalLoaded(data.length);
                } else {
                    setResults((prev) => [...prev, ...data]);
                    setTotalLoaded((prev) => prev + data.length);
                }

                // Check if there's more data
                if (data.length < PAGE_SIZE) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                // Show "no results" only for first page of search
                if (isNewSearch && data.length === 0) {
                    setNoResults(true);
                } else {
                    setNoResults(false);
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                setError(err.message);
                if (isNewSearch) {
                    setResults([]);
                }
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    // Reset everything for new search
    const resetAndSearch = useCallback(
        (query) => {
            // Reset pagination state
            setPage(1);
            setHasMore(true);
            setResults([]);
            setNoResults(false);
            setError(null);
            setIsSearching(!!query.trim());
            setCurrentQuery(query);

            // Clear observer to prevent auto-loading during reset
            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            // Fetch first page of new search
            fetchContent(query, 1, true);
        },
        [fetchContent],
    );

    // Debounced search handler
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear previous debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // If search is empty, reset to regular posts
        if (!value.trim()) {
            setIsSearching(false);
            setCurrentQuery('');
            resetAndSearch('');
            return;
        }

        // Set new debounce timer
        debounceTimerRef.current = setTimeout(() => {
            resetAndSearch(value);
        }, 300);
    };

    // Load more items (triggered by intersection observer)
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchContent(currentQuery, nextPage, false);
        }
    }, [loading, hasMore, page, currentQuery, fetchContent]);

    // Setup Intersection Observer
    useEffect(() => {
        if (loading || !hasMore) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' },
        );

        const currentLastItem = lastItemRef.current;
        if (currentLastItem) {
            observerRef.current.observe(currentLastItem);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loading, hasMore, loadMore]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only trigger "/" shortcut when not in an input/textarea
            const isInputFocused = ['INPUT', 'TEXTAREA'].includes(
                document.activeElement?.tagName,
            );

            // Support both Ctrl+K (Windows/Linux) and Cmd+K (macOS)
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
            } else if (event.key === '/' && !isInputFocused) {
                event.preventDefault();
                inputRef.current?.focus();
            }

            // Optional: Add ESC to clear search
            if (event.key === 'Escape') {
                setSearchTerm('');
                resetAndSearch('');
                inputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [resetAndSearch]);

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

    // Derive unique cached search terms for display
    const cachedQueries = Object.keys(cache)
        .map((key) => key.split(':')[0])
        .filter(
            (val, idx, arr) =>
                val && val !== 'initial' && arr.indexOf(val) === idx,
        );

    return (
        <div className='app'>
            <header>
                <h1>🔍 Search + Infinite Scroll</h1>
                <p>
                    Search posts with pagination, infinite scroll, caching &
                    text highlighting
                </p>
            </header>

            <div className='search-container'>
                <div className='search-box'>
                    <input
                        type='text'
                        ref={inputRef}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Press 'CTRL+K' / '⌘K' or '/' to search... Press 'ESC' to clear"
                        className='search-input'
                        autoFocus
                    />
                    {loading && (
                        <div className='search-spinner'>
                            <div className='spinner-small'></div>
                        </div>
                    )}
                </div>

                <div className='search-stats'>
                    {searchTerm && !loading && !error && (
                        <span className='result-count'>
                            Found {totalLoaded}{' '}
                            {totalLoaded === 1 ? 'result' : 'results'} for "
                            {searchTerm}"{hasMore && ' (scroll for more)'}
                        </span>
                    )}
                    {!searchTerm && !loading && totalLoaded > 0 && (
                        <span className='result-count'>
                            Loaded {totalLoaded} posts{' '}
                            {hasMore && '(scroll for more)'}
                        </span>
                    )}
                </div>

                {/* Cache stats (optional, shows performance benefit) */}
                {cachedQueries.length > 0 && (
                    <div className='history'>
                        <span className='hist-bold'>⚡ Cached queries:</span>{' '}
                        {cachedQueries.join(', ')}
                    </div>
                )}
            </div>

            <div className='results-container'>
                {/* Loading skeleton for initial load */}
                {loading && results.length === 0 && (
                    <div className='skeleton-list'>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='skeleton-item'>
                                <div className='skeleton-title'></div>
                                <div className='skeleton-text'></div>
                                <div className='skeleton-text'></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results with highlighting - keep visible during load-more */}
                {!error && results.length > 0 && (
                    <div className='results-list'>
                        {results.map((result, index) => (
                            <article
                                key={result.id}
                                className='result-card'
                                ref={
                                    index === results.length - 1
                                        ? lastItemRef
                                        : null
                                }
                            >
                                <h3>
                                    {highlightMatch(result.title, searchTerm)}
                                </h3>
                                <p>{highlightMatch(result.body, searchTerm)}</p>
                                <small>Post #{result.id}</small>
                            </article>
                        ))}
                    </div>
                )}

                {/* Loading more indicator (bottom spinner) */}
                {loading && results.length > 0 && (
                    <div className='loading-more'>
                        <div className='spinner-small'></div>
                        <p>Loading more...</p>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className='error-state'>
                        <p>⚠️ {error}</p>
                        <button
                            onClick={() => resetAndSearch(currentQuery)}
                            className='retry-btn'
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* No results */}
                {noResults && !loading && searchTerm && (
                    <div className='no-results'>
                        <p>😕 No results found for "{searchTerm}"</p>
                        <p className='suggestion'>
                            Try different keywords like "quis", "vero", or
                            "magni"
                        </p>
                    </div>
                )}

                {/* End of content message */}
                {!hasMore && results.length > 0 && !loading && (
                    <div className='end-message'>🏁 You've reached the end</div>
                )}

                {/* Empty initial state */}
                {!searchTerm && !loading && !error && results.length === 0 && (
                    <div className='empty-state'>
                        <p>✨ Start typing to search posts</p>
                        <p className='example'>Try: "quis", "vero", "magni"</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
