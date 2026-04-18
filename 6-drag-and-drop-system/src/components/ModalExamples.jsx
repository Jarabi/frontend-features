import { useId, useState } from 'react';
import { useModal } from '../context/useModal';
import { useToast } from '../context/useToast';

// Simple confirmation modal
export const ConfirmationModal = ({
    onConfirm,
    onCancel,
    message = 'Are you sure?',
}) => (
    <div>
        <p>{message}</p>
        <div className='modal-footer'>
            <button
                className='modal-btn modal-btn-secondary'
                onClick={onCancel}
            >
                Cancel
            </button>
            <button className='modal-btn modal-btn-danger' onClick={onConfirm}>
                Confirm
            </button>
        </div>
    </div>
);

// Form modal example
export const FormModal = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const nameId = useId();
    const emailId = useId();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='form-group'>
                <label htmlFor={nameId}>Name:</label>
                <input
                    type='text'
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    required
                />
            </div>
            <div className='form-group'>
                <label htmlFor={emailId}>Email:</label>
                <input
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                    required
                />
            </div>
            <div className='modal-footer'>
                <button
                    type='button'
                    className='modal-btn modal-btn-secondary'
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button type='submit' className='modal-btn modal-btn-primary'>
                    Submit
                </button>
            </div>
        </form>
    );
};

// Large content modal
export const LargeContentModal = ({ onClose }) => (
    <div>
        <h3>Detailed Information</h3>
        <p>This modal demonstrates scrolling with large content.</p>
        {[...Array(10)].map((_, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
                <h4>Section {i + 1}</h4>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                </p>
            </div>
        ))}
        <div className='modal-footer'>
            <button className='modal-btn modal-btn-primary' onClick={onClose}>
                Close
            </button>
        </div>
    </div>
);

// image modal
export const ImageModal = ({ imageUrl, onClose }) => (
    <div style={{ textAlign: 'center' }}>
        <img
            src={imageUrl}
            alt='Modal content'
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
        />
        <div className='modal-footer'>
            <button className='modal-btn modal-btn-primary' onClick={onClose}>
                Close
            </button>
        </div>
    </div>
);

// Demo component to show modal usage
export const ModalDemo = () => {
    const { openModal, closeTopModal } = useModal();
    const { success, info } = useToast();

    const handleOpenSimpleModal = () => {
        openModal({
            title: 'Simple Modal',
            content: (
                <div>
                    <p>This is a simple modal with basic content.</p>
                    <p>You can close it by:</p>
                    <ul>
                        <li>Clicking the ✕ button</li>
                        <li>Clicking outside the modal</li>
                        <li>Pressing ESC key</li>
                    </ul>
                    <div className='modal-footer'>
                        <button
                            className='modal-btn modal-btn-primary'
                            onClick={closeTopModal}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            ),
        });
    };

    const handleOpenConfirmationModal = () => {
        openModal({
            title: 'Confirm Action',
            content: (
                <ConfirmationModal
                    onConfirm={() => {
                        success('Action confirmed!', 2000);
                        closeTopModal();
                    }}
                    onCancel={closeTopModal}
                    message='Are you sure you want to proceed? This action cannot be undone.'
                />
            ),
        });
    };

    const handleOpenFormModal = () => {
        openModal({
            title: 'User Information',
            content: (
                <FormModal
                    onSubmit={(data) => {
                        success(`Welcome ${data.name}!`, 3000);
                        info(`Email: ${data.email}`, 2000);
                        closeTopModal();
                    }}
                    onCancel={closeTopModal}
                />
            ),
        });
    };

    const handleOpenLargeModal = () => {
        openModal({
            title: 'Large Content Modal',
            content: <LargeContentModal onClose={closeTopModal} />,
        });
    };

    const handleStackedModals = () => {
        openModal({
            title: 'Modal 1',
            content: (
                <div>
                    <p>This is the first modal.</p>
                    <button
                        className='modal-btn modal-btn-primary'
                        onClick={() => {
                            openModal({
                                title: 'Modal 2',
                                content: (
                                    <div>
                                        <p>
                                            This is the second modal (stacked on
                                            top).
                                        </p>
                                        <p>
                                            Notice how the background is still
                                            locked.
                                        </p>
                                        <button
                                            className='modal-btn modal-btn-primary'
                                            onClick={closeTopModal}
                                        >
                                            Close this modal
                                        </button>
                                    </div>
                                ),
                            });
                        }}
                    >
                        Open Another Modal
                    </button>
                    <div className='modal-footer'>
                        <button
                            className='modal-btn modal-btn-secondary'
                            onClick={closeTopModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            ),
        });
    };

    return (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={handleOpenSimpleModal} className='modal-demo-btn'>
                Simple Modal
            </button>
            <button
                onClick={handleOpenConfirmationModal}
                className='modal-demo-btn'
            >
                Confirmation
            </button>
            <button onClick={handleOpenFormModal} className='modal-demo-btn'>
                Form Modal
            </button>
            <button onClick={handleOpenLargeModal} className='modal-demo-btn'>
                Large Content
            </button>
            <button onClick={handleStackedModals} className='modal-demo-btn'>
                Stacked Modals
            </button>
        </div>
    );
};
