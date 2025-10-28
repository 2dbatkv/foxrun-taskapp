import api, { setAuthToken, clearAuthToken, AUTH_STORAGE_KEY } from './api';

export const login = async (password) => {
  const response = await api.post('/auth/login', { password });
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Ignore logout errors; session is stateless
  }
  clearStoredAuth();
  clearAuthToken();
};

export const persistAuth = (authData) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  setAuthToken(authData.access_token);
};

export const loadStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const initializeAuthFromStorage = () => {
  const stored = loadStoredAuth();
  if (!stored) {
    return null;
  }

  const expiresAt = stored.expires_at ? new Date(stored.expires_at) : null;
  if (expiresAt && expiresAt < new Date()) {
    clearStoredAuth();
    clearAuthToken();
    return null;
  }

  if (stored.access_token) {
    setAuthToken(stored.access_token);
  }

  return stored;
};
