import { useModal } from '../context/useModal';
import Modal from './Modal';

const ModalContainer = () => {
    const { modals, closeModal } = useModal();

    return (
        <>
            {modals.map((modal) => (
                <Modal
                    key={modal.id}
                    id={modal.id}
                    title={modal.title}
                    onClose={closeModal}
                    closeOnOutsideClick={modal.closeOnOutsideClick !== false}
                >
                    {modal.content}
                </Modal>
            ))}
        </>
    );
};

export default ModalContainer;