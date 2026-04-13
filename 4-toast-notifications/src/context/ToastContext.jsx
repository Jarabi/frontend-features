import { useState, useCallback } from "react";
import { ToastContext } from "./toastContext";
import { TOAST_TYPES } from "./toastConstants";

// Toast provider component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [position, setPosition] = useState('top-right'); // Default position

    // Generate unique ID for each toast
    const generateId = () => `${Date.now()} - ${Math.random().toString(36).slice(2, 11)}`;

    // Remove a specific toast
    const removeToast = useCallback(id => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Add a new toast
    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = generateId();
        const newToast = {
            id,
            message,
            type,
            duration,
            timestamp: Date.now()
        };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove toast after duration (if duration > 0)
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    // Remove all toasts
    const clearAllToasts = useCallback(() => setToasts([]), []);

    // Change toast position
    const setToastPosition = useCallback(newPosition => setPosition(newPosition), []);

    // Convenience methods
    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
    
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
        info
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};