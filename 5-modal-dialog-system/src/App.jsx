import { useToast } from './context/useToast';
import ToastContainer from './components/ToastContainer';
import { ModalDemo } from './components/ModalExamples';
import ModalContainer from './components/ModalContainer';
import './App.css';

function App() {
    // Get toast functions
    const { success, error, warning, info, setToastPosition, position } =
        useToast();

    // Toast position controls
    const changePosition = (newPosition) => {
        setToastPosition(newPosition);
        success(`Toast now appears at ${newPosition}`, 2000);
    };

    // Demo toast buttons
    const showDemoToasts = () => {
        success('Operation completed successfully!', 3000);
        error('Something went wrong. Please try again', 4000);
        warning('This action cannot be undone!', 3000);
        info('New update available. Refresh to install.', 5000);
    };

    return (
        <div className='app'>
            <ToastContainer />
            <ModalContainer />

            <header>
                <h1>🎭 Modal Dialog System</h1>
                <p>Production-grade features with modal dialogs</p>
            </header>

            {/* Toast demo controls */}
            <div className='toast-demo-controls'>
                <div className='toast-buttons'>
                    <button
                        onClick={() => success('Success message!')}
                        className='btn btn-success'
                    >
                        Success
                    </button>
                    <button
                        onClick={() => error('Error message!')}
                        className='btn btn-error'
                    >
                        Error
                    </button>
                    <button
                        onClick={() => warning('Warning message!')}
                        className='btn btn-warning'
                    >
                        Warning
                    </button>
                    <button
                        onClick={() => info('Info message!')}
                        className='btn btn-info'
                    >
                        Info
                    </button>
                    <button onClick={showDemoToasts} className='btn btn-demo'>
                        Show All
                    </button>
                </div>

                <div className='position-controls'>
                    <span>Toast Position: </span>
                    <select
                        value={position}
                        onChange={(e) => changePosition(e.target.value)}
                    >
                        <option value='top-right'>Top Right</option>
                        <option value='top-left'>Top Left</option>
                        <option value='top-center'>Top Center</option>
                        <option value='bottom-right'>Bottom Right</option>
                        <option value='bottom-left'>Bottom Left</option>
                        <option value='bottom-center'>Bottom Center</option>
                    </select>
                </div>
            </div>

            {/* Modal Demo Section */}
            <div className='modal-demo-section'>
                <h3>🎭 Modal Dialogs</h3>
                <p className='modal-demo-description'>
                    Test different modal patterns: simple, confirmation, forms,
                    large content, and stacked modals.
                    <br />
                    <strong>Features:</strong> Focus trap, ESC to close, click
                    outside to close, scroll lock, smooth animations.
                </p>
                <ModalDemo />
            </div>
        </div>
    );
}

export default App;
