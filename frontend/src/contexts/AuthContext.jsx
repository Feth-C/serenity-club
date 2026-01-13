// frontend/src/contexts/AuthContext.jsx

import { createContext, useEffect, useState } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Inicializa sessão
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api.get('/auth/me');
        setUser(userData.data || userData);
      } catch {
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

    /**
     * Backend retorna:
     * {
     *   success,
     *   message,
     *   data: { token, user }
     * }
     */

    const { token, user } = res.data;

    if (!token) throw new Error('Token não recebido');

    localStorage.setItem('token', token);
    setUser(user);
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: () => !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
