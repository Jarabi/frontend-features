import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from '@dnd-kit/modifiers';

import { useState } from 'react';
import { useDragDrop } from '../context/useDragDrop';
import { useToast } from '../context/useToast';
import DraggableItem from './DraggableItem';
import './DragDrop.css';

const SortableContainer = ({
    items,
    renderItem,
    onOrderChange,
    saveOrderFn,
}) => {
    const [activeId, setActiveId] = useState(null);
    const { setIsDragging, saving } = useDragDrop();
    const { info } = useToast();

    // Configure sensors for mouse, touch, and keyboard
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Start moving after 8px movement (prevents accidental drag)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Custom drop animation
    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        setIsDragging(true);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        setIsDragging(false);

        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Call the onOrderChange callback to update parent state
        onOrderChange(newOrder);

        // Temporary feedback
        info('Order changed - saving...', 1500);

        // Save to backend
        if (saveOrderFn) {
            await saveOrderFn(newOrder);
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
        setIsDragging(false);
    };

    // Find the active item for drag overlay
    const activeItem = activeId
        ? items.find((item) => item.id === activeId)
        : null;

    return (
        <div className='sortable-container'>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className='sortable-list'>
                        {items.map((item, index) => (
                            <DraggableItem
                                key={item.id}
                                id={item.id}
                                index={index}
                                onDragStart={() => handleDragStart}
                            >
                                {renderItem(item, index)}
                            </DraggableItem>
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeItem ? (
                        <div className="drag-overlay">
                            {renderItem(activeItem, items.findIndex(i => i.id === activeItem.id))}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {saving && (
                <div className="saving-indicator">
                    <div className="saving-spinner"></div>
                    <span>Saving order...</span>
                </div>
            )}
        </div>
    );
};

export default SortableContainer;
