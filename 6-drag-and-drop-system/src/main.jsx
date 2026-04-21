import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { DragDropProvider } from './context/DragDropContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ToastProvider>
            <DragDropProvider>
                <App />
            </DragDropProvider>
        </ToastProvider>
    </StrictMode>,
);
