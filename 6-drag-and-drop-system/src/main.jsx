import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';
import { DragDropProvider } from './context/DragDropContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ToastProvider>
            <ModalProvider>
                <DragDropProvider>
                    <App />
                </DragDropProvider>
            </ModalProvider>
        </ToastProvider>
    </StrictMode>,
);
