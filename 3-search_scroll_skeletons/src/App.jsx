import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import {
    SkeletonGrid,
    SkeletonListItem,
    SkeletonProfile,
} from './components/Skeletons';
import {
    SkeletonDashboard,
    SkeletonFeed,
    SkeletonProductPage,
} from './components/AdvancedSkeletons';

const API_BASE = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_SIZE = 10;

function App() {
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [noResults, setNoResults] = useState(false);

    // State to demonstrate different skeleton types
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'profile'

    // Add layout type to demonstrate different skeletons
    const [layoutType, setLayoutType] = useState('blog'); // 'blog', 'dashboard', 'product', 'social'

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
    const isFetchingRef = useRef(false);

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

            // Prevent concurrent fetches for the same logical request
            if (isFetchingRef.current && !isNewSearch) return;
            isFetchingRef.current = true;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }

            // Check cache first
            const cachedData = cacheRef.current[cacheKey];
            if (cachedData) {
                setLoading(false);
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
                isFetchingRef.current = false;
                return;
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
                if (controller.signal.aborted) return;

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
                if (!controller.signal.aborted) {
                    abortControllerRef.current = null;
                    setLoading(false);
                    isFetchingRef.current = false;
                }
            }
            // eslint-disable-next-line
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
        if (loading || !hasMore || error) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    !loading &&
                    hasMore &&
                    !error
                ) {
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
    }, [loading, hasMore, error, loadMore]);

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
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                    debounceTimerRef.current = null;
                }
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

    // Function to render appropriate skeleton based on layout
    const renderSkeletons = () => {
        switch (layoutType) {
            case 'blog':
                return <SkeletonGrid columns={2} count={6} hasImage={true} />;

            case 'dashboard':
                return <SkeletonDashboard />;

            case 'product':
                return <SkeletonProductPage />;

            case 'social':
                return <SkeletonFeed count={3} />;

            case 'profile':
                return <SkeletonProfile />;

            default:
                return <SkeletonGrid columns={2} count={6} />;
        }
    };

    // Function to render loaded content based on layout
    const renderContent = (results) => {
        switch (layoutType) {
            case 'blog':
                return (
                    <div className='results-grid'>
                        {results.map((result, index) => (
                            <article
                                key={result.id}
                                className='result-card grid-card'
                                ref={
                                    index === results.length - 1
                                        ? lastItemRef
                                        : null
                                }
                            >
                                <div className="card-image-placeholder">
                                    <div className="placeholder-icon">📝</div>
                                </div>
                                <div className="card-content">
                                    <h3>{highlightMatch(result.title, searchTerm)}</h3>
                                    <p>{highlightMatch(result.body, searchTerm)}</p>
                                    <small>Post #{result.id}</small>
                                </div>
                            </article>
                        ))}
                    </div>
                );
            
            case 'dashboard':
                return (
                    <div className="dashboard-content">
                        <div className="stats-grid">
                            {results.slice(0, 3).map(result => (
                                <div key={result.id} className="stat-card">
                                    <h4>{result.title}</h4>
                                    <p>{result.body.substring(0, 50)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="recent-items">
                            <h3>Recent Posts</h3>
                            {results.slice(0, 5).map(result => (
                                <div key={result.id} className="recent-item">
                                    <span>{result.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            
            case 'product':
                return (
                    <div className="product-page">
                        <div className="product-gallery">
                            <div className="main-image">📦 Product Image</div>
                        </div>
                        <div className="product-info">
                            <h1>{results[0]?.title}</h1>
                            <p>{results[0]?.body}</p>
                            <button className="buy-button">Add to Cart</button>
                        </div>
                    </div>
                );
            
            case 'social':
                return (
                    <div className="social-feed">
                        {results.map(result => (
                            <div key={result.id} className="feed-post">
                                <div className="postheader">
                                    <div className="avatar-placeholder">👤</div>
                                    <div className="post-meta">
                                        <strong>User {result.userId}</strong>
                                        <span>{result.title}</span>
                                    </div>
                                </div>
                                <p>{result.body}</p>
                                <div className="post-actions">
                                    <button>❤️ Like</button>
                                    <button>💬 Comment</button>
                                    <button>🔄 Share</button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            
            default:
                return (
                    <div className="results-list">
                        {results.map((result, index) => (
                            <article
                                key={result.id}
                                className="result-card"
                                ref={index === results.length - 1 ? lastItemRef : null}
                            >
                                <h3>{highlightMatch(result.title, searchTerm)}</h3>
                                <p>{highlightMatch(result.body, searchTerm)}</p>
                                <small>Post #{result.id}</small>
                            </article>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className='app'>
            <header>
                <h1>🔍 Search + Infinite Scroll + Skeletons</h1>
                <p>Production-grade loading skeletons with shimmer animation</p>
            </header>

            {/* Layout type selector */}
            <div className='layout-selector'>
                <button
                    className={layoutType === 'blog' ? 'active' : ''}
                    onClick={() => setLayoutType('blog')}
                >
                    📝 Blog View
                </button>
                <button
                    className={layoutType === 'dashboard' ? 'active' : ''}
                    onClick={() => setLayoutType('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button
                    className={layoutType === 'product' ? 'active' : ''}
                    onClick={() => setLayoutType('product')}
                >
                    🛍️ Product Page
                </button>
                <button
                    className={layoutType === 'social' ? 'active' : ''}
                    onClick={() => setLayoutType('social')}
                >
                    📱 Social Feed
                </button>
                <button
                    className={layoutType === 'profile' ? 'active' : ''}
                    onClick={() => setLayoutType('profile')}
                >
                    👤 Profile
                </button>
            </div>

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
                    {currentQuery && !loading && !error && (
                        <span className='result-count'>
                            Found {totalLoaded}{' '}
                            {totalLoaded === 1 ? 'result' : 'results'} for "
                            {currentQuery}"{hasMore && ' (scroll for more)'}
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
                {/* Initial loading - show appropriate skeletons */}
                {loading && results.length === 0 && renderSkeletons()}

                {/* Loaded content - based on layout type */}
                {!loading && !error && results.length > 0 && renderContent(results)}

                {/* Loading more indicator */}
                {loading && results.length > 0 && (
                    <div className='loading-more-skeletons'>
                        {layoutType === 'blog' && <SkeletonGrid columns={2} count={2} hasImage={true} />}
                        {layoutType === 'social' && <SkeletonFeed count={2} />}
                        {layoutType === 'dashboard' && <div className="loading-more">Loading more...</div> }
                        {layoutType === 'product' && <div className="loading-more">Loading more...</div> }
                    </div>
                )}

                {/* Error state */}
                {error && results.length === 0 && (
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

                {error && results.length > 0 && (
                    <div className='loading-more'>
                        <p>⚠️ Couldn't load more results.</p>
                        <button
                            onClick={() => {
                                setError(null);
                                fetchContent(currentQuery, page, false);
                            }}
                            className='retry-btn'
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* No results */}
                {noResults && !loading && currentQuery && (
                    <div className='no-results'>
                        <p>😕 No results found for "{currentQuery}"</p>
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
