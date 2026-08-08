import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { User } from '../types/api';

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      apiClient.get<User>('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    login,
    logout
  };
}
