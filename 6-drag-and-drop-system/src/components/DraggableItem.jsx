import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './DragDrop.css';

const DraggableItem = ({ id, index, children, onDragStart, onDragEnd }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, onDragStart, onDragEnd });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`draggable-item ${isDragging ? 'dragging' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className='drag-handle'>
                <svg
                    className='drag-icon'
                    width='20'
                    height='20'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                >
                    <path d='M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6-12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' />
                </svg>
            </div>
            <div className='drag-content'>{children}</div>
            <div className='drag-index'>{index + 1}</div>
        </div>
    );
};

export default DraggableItem;
