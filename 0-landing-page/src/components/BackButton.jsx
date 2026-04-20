import './BackButton.css';

const BackButton = () => {
    <a href={`${import.meta.env.BASE_URL}`} className='back-button'>
        ← Back to Features
    </a>;
};

export default BackButton;
