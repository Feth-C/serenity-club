// frontend/src/components/common/BackButton.jsx

import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    const navigate = useNavigate();
    return (
        <button onClick={() => navigate(-1)}>
            ← Indietro
        </button>
    );
};

export default BackButton;
