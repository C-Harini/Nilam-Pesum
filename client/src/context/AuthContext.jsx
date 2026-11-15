import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nilam_pesum_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('nilam_pesum_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (...args) => {
    let payload = {};
    if (typeof args[0] === 'object' && args[0] !== null) {
      payload = args[0];
    } else {
      payload = { phone: args[0], pin: args[1] };
    }
    const res = await authAPI.login(payload);
    const { token: newToken, user: newUser, greeting, isNewUser } = res.data;
    localStorage.setItem('nilam_pesum_token', newToken);
    localStorage.setItem('nilam_pesum_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return { user: newUser, greeting, isNewUser };
  };

  const register = async (...args) => {
    let payload = {};
    if (typeof args[0] === 'object' && args[0] !== null) {
      payload = args[0];
    } else {
      payload = { phone: args[0], pin: args[1], name: args[2] };
    }
    const res = await authAPI.register(payload);
    const { token: newToken, user: newUser, greeting } = res.data;
    localStorage.setItem('nilam_pesum_token', newToken);
    localStorage.setItem('nilam_pesum_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return { user: newUser, greeting, isNewUser: true };
  };

  const demoLogin = async () => {
    const res = await authAPI.demoLogin();
    const { token: newToken, user: newUser, greeting } = res.data;
    localStorage.setItem('nilam_pesum_token', newToken);
    localStorage.setItem('nilam_pesum_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return { user: newUser, greeting };
  };

  const logout = () => {
    localStorage.removeItem('nilam_pesum_token');
    localStorage.removeItem('nilam_pesum_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
