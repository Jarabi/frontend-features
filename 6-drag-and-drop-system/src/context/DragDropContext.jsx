import { useState, useCallback } from "react";
import { DragDropContext } from "./dragDropContext";
import { useToast } from "./useToast";

export const DragDropProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const { success, error: showError }  = useToast();

    // Load initial items from API
    const loadItems = useCallback(async fetchFn => {
        try {
            const data = await fetchFn();
            setItems(data);
            return data;
        } catch (err) {
            showError('Failed to load items:', err);
            return [];
        }
    }, [showError]);

    // Save new order to backend
    const saveOrder = useCallback(async (orderedItems, savefn) => {
        setSaving(true);
        try {
            await savefn(orderedItems);
            success('Order saved successsfully', 2000);
            return true
        } catch (err) {
            showError('Failed to save order:', err);
            return false;
        } finally {
            setSaving(false);
        }
    }, [success, showError]);

    // Reorder items locally
    const reorderItems = useCallback((oldIndex, newIndex) => {
        setItems(prevItems => {
            const newItems = [...prevItems];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);
            return newItems;
        });
    }, []);

    const value = {
        items,
        setItems,
        isDragging,
        setIsDragging,
        saving,
        loadItems,
        saveOrder,
        reorderItems
    };

    return (
        <DragDropContext.Provider value={value}>
            {children}
        </DragDropContext.Provider>
    )
}