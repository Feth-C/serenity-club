// frontend/src/components/header/Header.jsx

import './Header.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ user }) => {
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [activeUnitId, setActiveUnitId] = useState(
        localStorage.getItem('activeUnitId')
    );

    useEffect(() => {
        if (user?.units) {
            setUnits(user.units);

            // Se não houver unidade ativa ainda, seleciona a primeira
            if (!activeUnitId && user.units.length > 0) {
                const defaultUnit = user.units[0];
                setActiveUnitId(defaultUnit.id);
                localStorage.setItem('activeUnitId', defaultUnit.id);
            }
        }
    }, [user]);

    const handleUnitChange = (e) => {
        const unitId = e.target.value;
        setActiveUnitId(unitId);
        localStorage.setItem('activeUnitId', unitId);

        // Reload simples da rota atual
        navigate(0);
    };

    return (
        <header className="header">
            <div className="header__left">
                <strong>Serenity Club</strong>
            </div>

            <div className="header__center">
                {units.length > 1 && (
                    <select
                        className="header__unit-select"
                        value={activeUnitId || ''}
                        onChange={handleUnitChange}
                    >
                        {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="header__right">
                {user?.name}
            </div>
        </header>
    );
};

export default Header;
