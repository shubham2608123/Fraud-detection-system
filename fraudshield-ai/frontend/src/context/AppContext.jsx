import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('fraudshield_token');
    const savedUser = localStorage.getItem('fraudshield_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    if (!username || !password) return { success: false, error: 'Username and password required' };

    try {
      const res = await api.post('/auth/login', { username, password });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('fraudshield_token', newToken);
      localStorage.setItem('fraudshield_user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed';
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (username, password) => {
    if (!username || !password) return { success: false, error: 'Username and password required' };

    try {
      const res = await api.post('/auth/register', { username, password });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('fraudshield_token', newToken);
      localStorage.setItem('fraudshield_user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fraudshield_token');
    localStorage.removeItem('fraudshield_user');
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    setData(null);
  }, []);

  const fetchLatestData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/transactions/latest', {
        params: { _t: Date.now() },
      });
      setData(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadFile = useCallback(async (file) => {
    try {
      setUploading(true);
      setData(null);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/transactions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchLatestData();
      return res.data;
    } catch (err) {
      console.error('Upload error:', err);
      setData(null);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [fetchLatestData]);

  const deleteAllData = useCallback(async () => {
    try {
      await api.delete('/transactions');
      setData(null);
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  }, []);

  const value = {
    isLoggedIn,
    user,
    token,
    data,
    loading,
    uploading,
    login,
    register,
    logout,
    fetchLatestData,
    uploadFile,
    deleteAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
