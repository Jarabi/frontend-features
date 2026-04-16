import { useToast } from '../context/useToast';
import Toast from './Toast';
import './Toast.css';

const ToastContainer = () => {
    const { toasts, position, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className={`toast-container toast-container-${position}`}>
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;