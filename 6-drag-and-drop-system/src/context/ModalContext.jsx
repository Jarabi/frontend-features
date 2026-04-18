import { useState, useCallback, useEffect, useRef } from "react";
import { ModalContext } from "./modalContext";

export const ModalProvider = ({children}) => {
    const [modals, setModals] = useState([]);
    const bodyRef = useRef(document.body);

    // Add a new modal
    const openModal = useCallback(modalConfig => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        const newModal = {
            id,
            ...modalConfig,
            isOpen: true
        };

        setModals(prev => [...prev, newModal]);
        return id;
    }, []);

    // Close a specific modal
    const closeModal = useCallback(id => {
        setModals(prev => prev.filter(modal => modal.id !== id));
    }, []);

    // Close the top-most modal
    const closeTopModal = useCallback(() => {
        setModals(prev => prev.slice(0, -1));
    }, []);

    // Close all modals
    const closeAllModals = useCallback(() => {
        setModals([]);
    }, []);

    // Check if any modal is open
    const hasOpenModals = modals.length > 0;

    // Scroll lock effect
    useEffect(() => {
        if (hasOpenModals) {
            // Save original overflow
            const originalOverflow = bodyRef.current.style.overflow;
            bodyRef.current.style.overflow = 'hidden';

            return () => {
                bodyRef.current.style.overflow = originalOverflow;
            }
        }
    }, [hasOpenModals]);

    // ESC key handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== 'Escape' && !hasOpenModals) return;

            const topModal = modals[modals.length - 1];

            if (topModal?.closeOnEsc === false) return;

            topModal?.onClose?.(topModal.id);
            closeTopModal();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasOpenModals, modals, closeTopModal]);

    const value = {
        modals,
        openModal,
        closeModal,
        closeTopModal,
        closeAllModals,
        hasOpenModals,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};