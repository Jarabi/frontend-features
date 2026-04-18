import { useState, useEffect } from 'react';
import SortableContainer from './SortableContainer';
import { useToast } from '../context/useToast';
import './DragDrop.css';

// Mock API functions
const fetchTasks = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
        {
            id: 1,
            title: 'Learn React',
            description: 'Master React fundamentals',
            priority: 'high',
            completed: false,
        },
        {
            id: 2,
            title: 'Build drag and drop',
            description: 'Implement sortable lists',
            priority: 'medium',
            completed: false,
        },
        {
            id: 3,
            title: 'Add animations',
            description: 'Smooth transitions',
            priority: 'low',
            completed: false,
        },
        {
            id: 4,
            title: 'Test on mobile',
            description: 'Ensure touch works',
            priority: 'high',
            completed: false,
        },
        {
            id: 5,
            title: 'Deploy to production',
            description: 'Launch the feature',
            priority: 'medium',
            completed: false,
        },
    ];
};

const saveOrder = async (orderedItems) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(
        'Saved order:',
        orderedItems.map((item) => ({
            id: item.id,
            order: orderedItems.indexOf(item),
        })),
    );
    return true;
};

// Render item component
const TaskItem = ({ task }) => (
    <div className='task-item'>
        <div className='task-info'>
            <h4>{task.title}</h4>
            <p>{task.description}</p>
        </div>
        <div className={`task-priority priority-${task.priority}`}>
            {task.priority}
        </div>
    </div>
);

const DragDropDemo = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useToast();

    // Load initial items
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchTasks();
                setItems(data);
            } catch (err) {
                showError('Failed to load tasks:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [showError]);

    const handleOrderChange = (newOrder) => {
        setItems(newOrder);
    };

    const handleSaveOrder = async (newOrder) => {
        try {
            await saveOrder(newOrder);
            success('Order saved successfully!', 2000);
        } catch (err) {
            showError('Failed to save order:', err);
        }
    };

    const handleResetOrder = async () => {
        const originalData = await fetchTasks();
        setItems(originalData);
        success('Order reset to original.', 2000);
    };

    if (loading) {
        return (
            <div className='dragdrop-loading'>
                <div className='spinner'>
                    <p>Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='dragdrop-demo'>
            <div className='dragdrop-header'>
                <h3>📋 Sortable Task List</h3>
                <div className='dragdrop-controls'>
                    <button onClick={handleResetOrder} className='reset-btn'>
                        Reset Order
                    </button>
                    <div className='dragdrop-instructions'>
                        <span>💡 Drag the </span>
                        <svg
                            className='drag-icon-small'
                            width='16'
                            height='16'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                        >
                            <path d='M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6-12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' />
                        </svg>
                        <span> icon to reorder</span>
                    </div>
                </div>
            </div>

            <SortableContainer
                items={items}
                renderItem={(item, index) => (
                    <TaskItem task={item} index={index} />
                )}
                onOrderChange={handleOrderChange}
                saveOrderFn={handleSaveOrder}
            />

            <div className='dragdrop-footer'>
                <p className='dragdrop-note'>
                    ✅ Changes are auto-saved when you drop an item
                </p>
                <div className='dragdrop-tips'>
                    <strong>Tips:</strong>
                    <ul>
                        <li>🖱️ Drag using the handle (⋮⋮) on the left</li>
                        <li>📱 Touch and drag on mobile devices</li>
                        <li>
                            ⌨️ Use Tab to focus, then Space/Enter to drag with
                            keyboard
                        </li>
                        <li>💾 Order saves automatically to backend</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DragDropDemo;
