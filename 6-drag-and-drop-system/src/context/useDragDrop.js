import { useContext } from "react";
import { DragDropContext } from "./dragDropContext";

export const useDragDrop = () => {
    const context = useContext(DragDropContext);
    if (context === undefined) {
        throw new Error('useDragDrop must be used within a DragDropProvider');
    }
    return context;
}