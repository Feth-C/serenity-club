// frontend/src/contexts/AuthContext.jsx

import { createContext, useEffect, useState } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Inicializa sessão
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      try {
        const res = await api.get('/auth/me');
        const userData = res.data?.user;
        if (!userData?.units?.length) throw new Error('Utente senza unità');

        setUser(userData);

        const savedUnitId = localStorage.getItem('activeUnitId');
        const defaultUnit = userData.units.find(u => u.id === Number(savedUnitId)) || userData.units[0];

        setActiveUnit(defaultUnit);
        localStorage.setItem('activeUnitId', defaultUnit.id);

      } catch (err) {
        console.error('[AuthContext] init error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // -----------------------------
  // Login
  // -----------------------------
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;

    if (!token || !userData?.units?.length) throw new Error('Login inválido');

    localStorage.setItem('token', token);
    setUser(userData);

    const defaultUnit = userData.units[0];
    setActiveUnit(defaultUnit);
    localStorage.setItem('activeUnitId', defaultUnit.id);
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeUnitId');
    setUser(null);
    setActiveUnit(null);
  };

  // -----------------------------
  // Troca de unidade
  // -----------------------------
  const changeUnit = (unit) => {
    if (unit?.id !== activeUnit?.id) {
      setActiveUnit(unit);
      localStorage.setItem('activeUnitId', unit.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeUnit, loading, login, logout, changeUnit, isAuthenticated: () => !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
