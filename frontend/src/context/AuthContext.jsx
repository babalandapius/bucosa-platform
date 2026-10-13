import { createContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getUserProfile } from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logoutUser();
    setToken('');
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        setUser(profile.user || profile.data || profile.userData || profile);
      } catch (err) {
        console.error('Session expired or invalid token');
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const handleLogin = async (credentials) => {
    const data = await loginUser(credentials);
    setToken(data.token);

    const profile = data.user || data.data || {};
    setUser(profile);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: handleLogin, logout: handleLogout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};