import { useState, useEffect } from 'react';
import { TOAST_TYPES } from '../context/toastConstants';
import './Toast.css';

const Toast = ({ toast, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    const { id, message, type, duration } = toast;
    const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.info;

    // Handle progress bar animation
    useEffect(() => {
        if (duration <= 0) return;

        const interval = 10; // Update every 10ms
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            setProgress(100 - (currentStep / steps) * 100);

            if (currentStep >= steps) {
                clearInterval(timer);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [duration]);

    // Handle manual close with animation
    const handleClose = () => {
        setIsExiting(true);

        const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            onClose(id);
            return;
        }

        setTimeout(() => {
            onClose(id);
        }, 300); // Match animation duration
    };

    return (
        <div
            className={`toast ${toastConfig.className} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
            role='alert'
            aria-label={toastConfig.ariaLabel}
        >
            <div className='toast-content'>
                <span className='toast-icon'>{toastConfig.icon}</span>
                <div className='toast-message'>{message}</div>
                <button
                    className='toast-close'
                    onClick={handleClose}
                    aria-label='Close notification'
                >
                    ✕
                </button>
            </div>
            {duration > 0 && (
                <div
                    className='toast-progress'
                    style={{ width: `${progress}%` }}
                />
            )}
        </div>
    );
};

export default Toast;
