import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './context/useToast';
import { useModal } from './context/useModal';
import {
    SkeletonGrid,
    SkeletonListItem,
    SkeletonProfile,
} from './components/Skeletons';
import ToastContainer from './components/ToastContainer';
import { ModalDemo } from './components/ModalExamples';
import ModalContainer from './components/ModalContainer';
import DragDropDemo from './components/DragDropDemo';
import './App.css';

const API_BASE = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_SIZE = 10;
const MAX_CACHE_ENTRIES = 20;

function App() {
    // Get toast functions
    const { success, error, warning, info, setToastPosition, position } =
        useToast();
    const { hasOpenModals } = useModal();

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorState, setErrorState] = useState(null);
    const [noResults, setNoResults] = useState(false);
    const [cache, setCache] = useState({});
    const [page, setPage] = useState(1);
    const [totalLoaded, setTotalLoaded] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [currentQuery, setCurrentQuery] = useState('');
    const [searchFilteredResults, setSearchFilteredResults] = useState([]);

    const inputRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);
    const observerRef = useRef(null);
    const lastItemRef = useRef(null);
    const isFetchingRef = useRef(false);
    const cacheOrderRef = useRef([]);

    // Function to highlight matched text
    const highlightMatch = (text, search) => {
        if (!search.trim()) return text;

        const regex = new RegExp(
            `(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
            'gi',
        );
        const parts = text.split(regex);

        return parts.map((part, i) =>
            i % 2 === 1 ? (
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

    const cacheRef = useRef(cache);
    useEffect(() => {
        cacheRef.current = cache;
    }, [cache]);

    const touchCacheKey = useCallback((key) => {
        cacheOrderRef.current = [
            key,
            ...cacheOrderRef.current.filter((existing) => existing !== key),
        ];
    }, []);

    const addCacheEntry = useCallback(
        (key, data) => {
            setCache((prev) => {
                const next = {
                    ...prev,
                    [key]: data,
                };
                cacheRef.current = next;
                touchCacheKey(key);
                if (Object.keys(next).length > MAX_CACHE_ENTRIES) {
                    const evictKey = cacheOrderRef.current.pop();
                    if (evictKey) {
                        delete next[evictKey];
                    }
                }
                return next;
            });
        },
        [touchCacheKey],
    );

    const getCachedData = useCallback(
        (key) => {
            const entry = cacheRef.current[key];
            if (entry) {
                touchCacheKey(key);
            }
            return entry;
        },
        [touchCacheKey],
    );

    // Fetch content with toast notification
    const fetchContent = useCallback(
        async (query, pageNum, isNewSearch = false) => {
            const cacheKey = getCacheKey(query, pageNum);

            // Prevent concurrent fetches for the same logical request
            if (isFetchingRef.current && !isNewSearch) return;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            isFetchingRef.current = true;

            // Check cache first
            const cachedData = getCachedData(cacheKey);
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
                } else {
                    setHasMore(true);
                }
                isFetchingRef.current = false;
                return;
            }

            setLoading(true);
            setErrorState(null);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                // For search queries, fetch all candidates once and filter client-side
                // For non-search, fetch incrementally by page
                const isSearchQuery = query.trim();

                let data;
                let paginatedData;
                let totalAvailable;
            
                if (isSearchQuery && (isNewSearch || pageNum === 1)) {
                    // First load of search: fetch all candidates
                    const url = `${API_BASE}?_limit=100`;
                    const response = await fetch(url, {
                        signal: controller.signal,
                    });
                    if (!response.ok) throw new Error('Failed to fetch');

                    data = await response.json();
                    if (controller.signal.aborted) return;

                    // Apply client-side filtering for search queries
                    const searchTerm = query.toLowerCase();
                    data = data.filter(
                        (post) =>
                            post.title.toLowerCase().includes(searchTerm) ||
                            post.body.toLowerCase().includes(searchTerm),
                    );

                    // Store filtered results for pagination
                    setSearchFilteredResults(data);
                    totalAvailable = data.length;
                } else if (isSearchQuery && pageNum > 1) {
                    // Pagination of search: use already-filtered results
                    data = searchFilteredResults;
                    totalAvailable = data.length;
                } else {
                    // Non-search: fetch incrementally by page
                    const url = `${API_BASE}?_page=${pageNum}&_limit=${PAGE_SIZE}`;
                    const response = await fetch(url, {
                        signal: controller.signal,
                    });
                    if (!response.ok) throw new Error('Failed to fetch');

                    data = await response.json();
                    if (controller.signal.aborted) return;
                    paginatedData = data;
                    totalAvailable =
                        pageNum * PAGE_SIZE +
                        (data.length === PAGE_SIZE ? 1 : 0);
                }

                // Apply pagination
                if (!paginatedData) {
                    const startIndex = (pageNum - 1) * PAGE_SIZE;
                    const endIndex = startIndex + PAGE_SIZE;
                    paginatedData = data.slice(startIndex, endIndex);
                }

                // Update cache with the paginated data
                addCacheEntry(cacheKey, paginatedData);

                // Update results
                if (isNewSearch) {
                    setResults(paginatedData);
                    setTotalLoaded(paginatedData.length);
                } else {
                    setResults((prev) => [...prev, ...paginatedData]);
                    setTotalLoaded((prev) => prev + paginatedData.length);

                    if (paginatedData.length > 0) {
                        info(`Loaded ${paginatedData.length} more items`, 1500);
                    }
                }

                const hasMoreData = isSearchQuery
                    ? totalAvailable > pageNum * PAGE_SIZE
                    : paginatedData.length === PAGE_SIZE;
                
                if (!hasMoreData) {
                    setHasMore(false);
                    if (pageNum > 1) {
                        info("You've reached the end!", 2000);
                    }
                } else {
                    setHasMore(true);
                }

                if (isNewSearch && paginatedData.length === 0) {
                    setNoResults(true);
                    warning(`No results found for "${query}"`, 3000);
                } else {
                    setNoResults(false);
                    if (isNewSearch && isSearchQuery) {
                        success(
                            `Found ${data.length} results for "${query}"`,
                            2000,
                        );
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                setErrorState(err.message);
                error(`Failed to load: ${err.message}`, 4000);
                if (isNewSearch) {
                    setResults([]);
                }
            } finally {
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                    setLoading(false);
                    isFetchingRef.current = false;
                }
            }
        },
        [
            addCacheEntry,
            getCachedData,
            success,
            error,
            warning,
            info,
            searchFilteredResults,
        ],
    );

    // Reset everything for new search
    const resetAndSearch = useCallback(
        (query) => {
            // Reset pagination state
            setPage(1);
            setHasMore(true);
            setResults([]);
            setSearchFilteredResults([]);
            setNoResults(false);
            setErrorState(null);
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
        if (loading || !hasMore || errorState) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    !loading &&
                    hasMore &&
                    !errorState
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
    }, [loading, hasMore, errorState, loadMore]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only trigger "/" shortcut when not in an input/textarea
            const isInputFocused = ['INPUT', 'TEXTAREA'].includes(
                document.activeElement?.tagName,
            );

            // Support both Ctrl+K (Windows/Linux) and Cmd+K (macOS)
            if (
                ((event.ctrlKey || event.metaKey) && event.key === 'k') ||
                (event.key === '/' && !isInputFocused)
            ) {
                event.preventDefault();
                inputRef.current?.focus();
                info('Search focused - start typing!', 1500);
            }

            if (event.key === 'Escape' && !hasOpenModals) {
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                    debounceTimerRef.current = null;
                }
                setSearchTerm('');
                resetAndSearch('');
                inputRef.current?.blur();
                info('Search cleared', 1000);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [resetAndSearch, info, hasOpenModals]);

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

    // Toast position controls
    const changePosition = (newPosition) => {
        setToastPosition(newPosition);
        success(`Toast now appears at ${newPosition}`, 2000);
    };

    // Demo toast buttons
    const showDemoToasts = () => {
        success('Operation completed successfully!', 3000);
        error('Something went wrong. Please try again', 4000);
        warning('This action cannot be undone!', 3000);
        info('New update available. Refresh to install.', 5000);
    };

    // Derive unique cached search terms for display
    const cachedQueries = Object.keys(cache)
        .map((key) => key.split(':')[0])
        .filter(
            (val, idx, arr) =>
                val && val !== 'initial' && arr.indexOf(val) === idx,
        );

    // Render skeletons based on view mode
    const renderSkeletons = () => {
        switch (viewMode) {
            case 'grid':
                return <SkeletonGrid columns={2} count={6} hasImage={true} />;

            case 'list':
                return (
                    <div className='skeleton-list-container'>
                        {[...Array(5)].map((_, i) => (
                            <SkeletonListItem key={i} />
                        ))}
                    </div>
                );

            case 'profile':
                return <SkeletonProfile />;

            default:
                return <SkeletonGrid columns={2} count={6} />;
        }
    };

    return (
        <div className='app'>
            <ToastContainer />
            <ModalContainer />

            <header>
                <h1>🔍 Search + Infinite Scroll + Toasts</h1>
                <p>Production-grade features with toast notifications</p>
            </header>

            {/* Toast demo controls */}
            <div className='toast-demo-controls'>
                <div className='toast-buttons'>
                    <button
                        onClick={() => success('Success message!')}
                        className='btn btn-success'
                    >
                        Success
                    </button>
                    <button
                        onClick={() => error('Error message!')}
                        className='btn btn-error'
                    >
                        Error
                    </button>
                    <button
                        onClick={() => warning('Warning message!')}
                        className='btn btn-warning'
                    >
                        Warning
                    </button>
                    <button
                        onClick={() => info('Info message!')}
                        className='btn btn-info'
                    >
                        Info
                    </button>
                    <button onClick={showDemoToasts} className='btn btn-demo'>
                        Show All
                    </button>
                </div>

                <div className='position-controls'>
                    <span>Toast Position: </span>
                    <select
                        value={position}
                        onChange={(e) => changePosition(e.target.value)}
                    >
                        <option value='top-right'>Top Right</option>
                        <option value='top-left'>Top Left</option>
                        <option value='top-center'>Top Center</option>
                        <option value='bottom-right'>Bottom Right</option>
                        <option value='bottom-left'>Bottom Left</option>
                        <option value='bottom-center'>Bottom Center</option>
                    </select>
                </div>
            </div>

            {/* Modal Demo Section */}
            <div className='modal-demo-section'>
                <h3>🎭 Modal Dialogs</h3>
                <p className='modal-demo-description'>
                    Test different modal patterns: simple, confirmation, forms,
                    large content, and stacked modals.
                    <br />
                    <strong>Features:</strong> Focus trap, ESC to close, click
                    outside to close, scroll lock, smooth animations.
                </p>
                <ModalDemo />
            </div>

            {/* Drag and Drop Demo Section */}
            <div className='dragdrop-demo-section'>
                <h3>🔄 Drag and Drop</h3>
                <p className='dragdrop-demo-description'>
                    Reorder tasks by dragging. Features include:
                    <br />
                    <strong>✓</strong> Smooth drag animations &nbsp;|&nbsp;
                    <strong>✓</strong> Touch/mobile support &nbsp;|&nbsp;
                    <strong>✓</strong> Keyboard accessibility &nbsp;|&nbsp;
                    <strong>✓</strong> Auto-save to backend
                </p>
                <DragDropDemo />
            </div>

            {/* View mode selector */}
            <div className='view-toggle'>
                <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                >
                    Grid View
                </button>
                <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                >
                    List View
                </button>
                <button
                    className={viewMode === 'profile' ? 'active' : ''}
                    onClick={() => setViewMode('profile')}
                >
                    Profile View
                </button>
            </div>

            {/* Search container */}
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
                    {currentQuery && !loading && !errorState && (
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

                {/* Cache stats */}
                {cachedQueries.length > 0 && (
                    <div className='history'>
                        <span className='hist-bold'>⚡ Cached queries:</span>{' '}
                        {cachedQueries.join(', ')}
                    </div>
                )}
            </div>

            <div className='results-container'>
                {/* Loading skeletons */}
                {loading && results.length === 0 && renderSkeletons()}

                {/* Loaded content - based on layout type */}
                {!loading && !errorState && results.length > 0 && (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'results-grid'
                                : 'results-list'
                        }
                    >
                        {results.map((result, index) => (
                            <article
                                key={result.id}
                                className={`result-card ${viewMode === 'grid' ? 'grid-card' : ''}`}
                                ref={
                                    index === results.length - 1
                                        ? lastItemRef
                                        : null
                                }
                            >
                                {viewMode === 'grid' && (
                                    <div className='card-image-placeholder'>
                                        <div className='placeholder-icon'>
                                            📝
                                        </div>
                                    </div>
                                )}
                                <div className='card-content'>
                                    <h3>
                                        {highlightMatch(
                                            result.title,
                                            searchTerm,
                                        )}
                                    </h3>
                                    <p>
                                        {highlightMatch(
                                            result.body,
                                            searchTerm,
                                        )}
                                    </p>
                                    <small>Post #{result.id}</small>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Loading more indicator */}
                {loading && results.length > 0 && (
                    <div className='loading-more-skeletons'>
                        {viewMode === 'grid' && (
                            <SkeletonGrid
                                columns={2}
                                count={2}
                                hasImage={true}
                            />
                        )}
                        {viewMode === 'list' && (
                            <div className='loading-more'>Loading more...</div>
                        )}
                        {viewMode === 'profile' && (
                            <div className='loading-more'>Loading more...</div>
                        )}
                    </div>
                )}

                {/* Error state */}
                {errorState && results.length === 0 && (
                    <div className='error-state'>
                        <p>⚠️ {errorState}</p>
                        <button
                            onClick={() => resetAndSearch(currentQuery)}
                            className='retry-btn'
                        >
                            Retry
                        </button>
                    </div>
                )}

                {errorState && results.length > 0 && (
                    <div className='loading-more'>
                        <p>⚠️ Couldn't load more results.</p>
                        <button
                            onClick={() => {
                                setErrorState(null);
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
                {!searchTerm &&
                    !loading &&
                    !errorState &&
                    results.length === 0 && (
                        <div className='empty-state'>
                            <p>✨ Start typing to search posts</p>
                            <p className='example'>
                                Try: "quis", "vero", "magni"
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default App;
