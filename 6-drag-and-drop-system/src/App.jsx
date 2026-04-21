import ToastContainer from './components/ToastContainer';
import DragDropDemo from './components/DragDropDemo';
import './App.css';

function App() {
    return (
        <div className='app'>
            <ToastContainer />

            <header>
                <h1>🔄 Drag and Drop System</h1>
                <p>
                    Production-grade features with drag and drop functionality
                </p>
            </header>

            {/* Drag and Drop Demo Section */}
            <div className='dragdrop-demo-section'>
                <h3>🔄 Drag and Drop</h3>
                <p className='dragdrop-demo-description'>
                    Reorder tasks by dragging. Features include:
                    <br />
                    <strong>✓</strong> Smooth drag animations &nbsp;|&nbsp;
                    <strong>✓</strong> Touch/mobile support &nbsp;|&nbsp;
                    <strong>✓</strong> Keyboard accessibility &nbsp;|&nbsp;
                    <strong>✓</strong> Auto-save to backend
                </p>
                <DragDropDemo />
            </div>
        </div>
    );
}

export default App;
