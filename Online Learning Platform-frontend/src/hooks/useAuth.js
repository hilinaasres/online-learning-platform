import { useCallback, useState } from "react";

const STORAGE_KEY = "olp_auth";

function readStoredAuth() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const auth = raw ? JSON.parse(raw) : null;
    return auth?.user && auth?.token ? auth : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [auth, setAuthState] = useState(readStoredAuth);

  const setUser = useCallback((user, token) => {
    if (user && token) {
      const nextAuth = { user, token };
      setAuthState(nextAuth);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    } else {
      setAuthState(null);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => setUser(null), [setUser]);

  return { user: auth?.user || null, setUser, logout };
}
