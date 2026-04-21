import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_BASE = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_SIZE = 10;

function App() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const abortControllerRef = useRef(null);
    const isFetchingRef = useRef(false);
    const observerRef = useRef(null);
    const lastItemRef = useRef(null);

    // Fetch function with cancellation
    const fetchItems = useCallback(async (pageToFetch) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        setLoading(true);
        setError(null);

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch(
                `${API_BASE}?_page=${pageToFetch}&_limit=${PAGE_SIZE}`,
                { signal: controller.signal },
            );

            if (!response.ok) throw new Error('Failed to fetch posts');

            const data = await response.json();

            if (data.length < PAGE_SIZE) {
                setHasMore(false);
            }

            setItems((prev) => [...prev, ...data]);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
            }
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
        // eslint-disable-next-line no-console
    }, []);

    // Load first page on mount
    useEffect(() => {
        fetchItems(1);
    }, [fetchItems]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1 && hasMore) {
            fetchItems(page);
        }
    }, [page, hasMore, fetchItems]);

    // IntersectionObserver setup
    useEffect(() => {
        if (loading || !hasMore) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    setPage((prev) => prev + 1);
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
    }, [loading, hasMore]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const retry = () => fetchItems(page);

    return (
        <div className='app'>
            <h1>Infinite Scroll Demo</h1>

            <div className='items-list'>
                {items.map((item) => (
                    <div key={item.id} className='item-card'>
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                    </div>
                ))}

                {/* Sentinel that triggers loading */}
                {!loading && hasMore && items.length > 0 && (
                    <div ref={lastItemRef} className='sentinel' />
                )}

                {/* Loading spinner */}
                {loading && (
                    <div className='loading-spinner'>
                        <div className='spinner'></div>
                        <p>Loading more posts...</p>
                    </div>
                )}

                {/* End of data */}
                {!hasMore && items.length > 0 && (
                    <div className='end-message'>
                        🎉 You've reached the end!
                    </div>
                )}

                {/* Error UI */}
                {error && (
                    <div className='error-message'>
                        <p>⚠️ {error}</p>
                        <button onClick={retry}>Retry</button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && items.length === 0 && !error && (
                    <div className='empty-state'>No posts found.</div>
                )}
            </div>
        </div>
    );
}

export default App;
