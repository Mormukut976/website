import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        window.localStorage.removeItem('token');
        setLoading(false);
      });
  }, []);

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    const { token, user: userData } = res.data;
    window.localStorage.setItem('token', token);
    setUser(userData);
  };

  const register = async ({ phone, password, nickname, inviteCode }) => {
    const res = await api.post('/auth/register', {
      phone,
      password,
      nickname,
      inviteCode,
    });
    const { token, user: userData } = res.data;
    window.localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    window.localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
