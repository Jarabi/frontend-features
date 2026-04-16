import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({
    id,
    title,
    children,
    onClose,
    closeOnOutsideClick = true,
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

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            const focusable =
                modalRef.current?.querySelectorAll(
                    'button:not(:disabled):not([aria-hidden="true"]), [href]:not([aria-hidden="true"]), input:not(:disabled):not([aria-hidden="true"]), select:not(:disabled):not([aria-hidden="true"]), textarea:not(:disabled):not([aria-hidden="true"]), [tabindex]:not([tabindex="-1"]):not(:disabled):not([aria-hidden="true"])',
                ) ?? [];

            const firstFocusable = focusable[0];
            const lastFocusable = focusable[focusable.length - 1];

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
        if (closeOnOutsideClick && e.target === e.currentTarget) {
            onClose(id);
        }
    };

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
                    >
                        ✕
                    </button>
                </div>

                <div className='modal-body'>{children}</div>
            </div>
        </div>,
        document.body,
    );
};

export default Modal;
