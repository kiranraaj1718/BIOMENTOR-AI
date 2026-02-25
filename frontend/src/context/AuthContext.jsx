import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('biomentor_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('biomentor_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('biomentor_user');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('biomentor_token', access_token);
    localStorage.setItem('biomentor_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, username, password, fullName) => {
    const res = await authAPI.register({ email, username, password, full_name: fullName });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('biomentor_token', access_token);
    localStorage.setItem('biomentor_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const resetPassword = async (email, newPassword) => {
    const res = await authAPI.resetPassword({ email, new_password: newPassword });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('biomentor_token', access_token);
    localStorage.setItem('biomentor_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('biomentor_token');
    localStorage.removeItem('biomentor_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('biomentor_user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, resetPassword, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
