import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('epms_token') || null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved      = localStorage.getItem('epms_user');
    const savedToken = localStorage.getItem('epms_token');
    if (saved && savedToken) {
      try { setUser(JSON.parse(saved)); } catch {}
      setToken(savedToken);
    }
    setReady(true);
  }, []);

  // Accepts: login({ token, user })  OR  login(user, token)
  const login = (dataOrUser, legacyToken) => {
    let resolvedUser, resolvedToken;
    if (legacyToken !== undefined) {
      resolvedUser  = dataOrUser;
      resolvedToken = legacyToken;
    } else {
      resolvedToken = dataOrUser?.token;
      resolvedUser  = dataOrUser?.user;
    }
    if (!resolvedToken || !resolvedUser) {
      console.error('AuthContext.login: missing token or user', { resolvedUser, resolvedToken });
      return;
    }
    localStorage.setItem('epms_token', resolvedToken);
    localStorage.setItem('epms_user',  JSON.stringify(resolvedUser));
    setToken(resolvedToken);
    setUser(resolvedUser);
  };

  // Call this after a profile update to sync local state
  const updateUser = (updatedFields) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('epms_user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = async () => {
    const savedToken = localStorage.getItem('epms_token');
    if (savedToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${savedToken}` },
        });
      } catch (err) { console.warn('Logout API failed:', err.message); }
    }
    localStorage.removeItem('epms_token');
    localStorage.removeItem('epms_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
