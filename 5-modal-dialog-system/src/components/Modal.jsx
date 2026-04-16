import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({
    id,
    title,
    children,
    onClose,
    closeOnOutsideClick = true,
    closeOnEsc = true,
}) => {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    // Focus trap: keep focus inside modal
    useEffect(() => {
        if (!modalRef.current) return;

        // Store the element that had focus before modal opened
        previousFocusRef.current = document.activeElement;

        // Focus the modal container
        modalRef.current.focus();

        // Get all focusable elements inside modal
        const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab: if on first element, move to last
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable?.focus();
                }
            } else {
                // Tab: if on last element, move to first
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);

        return () => {
            document.removeEventListener('keydown', handleTabKey);
            // Restore focus to previous element
            previousFocusRef.current?.focus();
        };
    }, []);

    // Handle outside click
    const handleBackdropClick = (e) => {
        if (closeOnOutsideClick && e.target === e.currenTarget) {
            onClose(id);
        }
    };

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (closeOnEsc && e.key === 'Escape') {
                onClose(id);
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeOnEsc, id, onClose]);

    return createPortal(
        <div
            className='modal-overlay modal-fade-in'
            onClick={handleBackdropClick}
            role='dialog'
            aria-modal='true'
            aria-labelledby={title ? `modal-title-${id}` : undefined}
        >
            <div
                ref={modalRef}
                className='modal-container modal-slide-up'
                tabIndex={-1}
            >
                <div className='modal-header'>
                    {title && (
                        <h2 id={`modal-title-${id}`} className='modal-title'>
                            {title}
                        </h2>
                    )}
                    <button
                        className='modal-close-btn'
                        onClick={() => onClose(id)}
                        aria-label='Close modal'
                    >✕</button>
                </div>

                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
