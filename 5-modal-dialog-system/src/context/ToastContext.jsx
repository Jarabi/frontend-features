import { useState, useCallback, useRef, useEffect } from 'react';
import { ToastContext } from './toastContext';
import { TOAST_TYPES } from './toastConstants';

// Toast provider component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [position, setPosition] = useState('top-right'); // Default position
    const timeoutsRef = useRef(new Map());

    // Generate unique ID for each toast
    const generateId = () =>
        `${Date.now()} - ${Math.random().toString(36).slice(2, 11)}`;

    // Remove a specific toast
    const removeToast = useCallback((id) => {
        // Clear timeout if it exists
        const timeoutId = timeoutsRef.current.get(id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutsRef.current.delete(id);
        }
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Add a new toast
    const addToast = useCallback(
        (message, type = 'info', duration = 5000) => {
            const id = generateId();
            const newToast = {
                id,
                message,
                type,
                duration,
                timestamp: Date.now(),
            };

            setToasts((prev) => [...prev, newToast]);

            // Auto-remove toast after duration (if duration > 0)
            if (duration > 0) {
                const timeoutId = setTimeout(() => {
                    removeToast(id);
                }, duration);
                timeoutsRef.current.set(id, timeoutId);
            }

            return id;
        },
        [removeToast],
    );

    // Remove all toasts
    const clearAllToasts = useCallback(() => {
        // Clear all timeouts
        timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
        timeoutsRef.current.clear();
        setToasts([]);
    }, []);

    // Change toast position
    const setToastPosition = useCallback(
        (newPosition) => setPosition(newPosition),
        [],
    );

    // Convenience methods
    const success = useCallback(
        (message, duration) => addToast(message, 'success', duration),
        [addToast],
    );
    const error = useCallback(
        (message, duration) => addToast(message, 'error', duration),
        [addToast],
    );
    const warning = useCallback(
        (message, duration) => addToast(message, 'warning', duration),
        [addToast],
    );
    const info = useCallback(
        (message, duration) => addToast(message, 'info', duration),
        [addToast],
    );

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            timeoutsRef.current.clear();
        };
    }, []);

    const value = {
        toasts,
        position,
        addToast,
        removeToast,
        clearAllToasts,
        setToastPosition,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
    );
};
