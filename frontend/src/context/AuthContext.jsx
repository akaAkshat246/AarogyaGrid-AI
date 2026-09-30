import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const USERS_KEY = 'aarogyagrid_users';
const SESSION_KEY = 'aarogyagrid_session';

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'));

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const u = { name, email, password };
    users.push(u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser({ name, email, mode: 'account' });
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) {
      throw new Error('Invalid password or email.');
    }
    setUser({ name: u.name, email: u.email, mode: 'account' });
  };

  const loginWithGoogle = (credentialResponse) => {
    let profile = null;
    if (typeof credentialResponse === 'string') {
      profile = decodeJwt(credentialResponse);
    } else if (credentialResponse?.credential) {
      profile = decodeJwt(credentialResponse.credential);
    } else if (credentialResponse?.email) {
      profile = credentialResponse;
    }

    if (!profile) {
      throw new Error('Could not parse Google authentication profile.');
    }

    const googleUser = {
      name: profile.name || profile.given_name || 'Google User',
      email: profile.email,
      picture: profile.picture || '',
      mode: 'google',
      sub: profile.sub
    };

    setUser(googleUser);
    return googleUser;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signup, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
