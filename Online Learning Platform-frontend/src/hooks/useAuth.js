import { useCallback, useState } from "react";

const STORAGE_KEY = "olp_user";

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUserState] = useState(readStoredUser);

  const setUser = useCallback((next) => {
    setUserState(next);
    if (next) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => setUser(null), [setUser]);

  return { user, setUser, logout };
}
