import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const tokens = localStorage.getItem('streamtube_tokens');
    if (!tokens) { setUser(null); setLoading(false); return; }
    try {
      const me = await authApi.fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const onLogout = () => setUser(null);
    window.addEventListener('streamtube:logout', onLogout);
    return () => window.removeEventListener('streamtube:logout', onLogout);
  }, [loadUser]);

  const login = async (username, password) => {
    const u = await authApi.login(username, password);
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const u = await authApi.register(payload);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await authApi.fetchMe();
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
