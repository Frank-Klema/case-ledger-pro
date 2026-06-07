import { useCallback, useEffect, useState } from 'react';
import {
  StoredUser, SafeUser, getAllUsers, saveAllUsers, sha256,
  getCurrentSession, setCurrentSession, toSafe,
} from '@/lib/auth';

/**
 * Local-only auth hook. Keeps a "current user" in state; broadcasts changes
 * via the `legalcase-auth-changed` window event so other tabs/components can
 * react synchronously.
 */
export const useAuth = () => {
  const [user, setUser] = useState<SafeUser | null>(() => {
    const id = getCurrentSession();
    if (!id) return null;
    const u = getAllUsers().find(x => x.id === id);
    return u ? toSafe(u) : null;
  });

  useEffect(() => {
    const refresh = () => {
      const id = getCurrentSession();
      if (!id) { setUser(null); return; }
      const u = getAllUsers().find(x => x.id === id);
      setUser(u ? toSafe(u) : null);
    };
    window.addEventListener('legalcase-auth-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('legalcase-auth-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const broadcast = () => window.dispatchEvent(new Event('legalcase-auth-changed'));

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const e = email.trim().toLowerCase();
    if (!e || !password) throw new Error('Email and password are required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    const users = getAllUsers();
    if (users.some(u => u.email === e)) throw new Error('An account with this email already exists');
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: e,
      passwordHash: await sha256(password),
      displayName: displayName.trim() || e.split('@')[0],
      avatar: undefined,
      isAdmin: users.length === 0, // first user is admin
      createdAt: new Date().toISOString(),
    };
    saveAllUsers([...users, newUser]);
    setCurrentSession(newUser.id);
    broadcast();
    return toSafe(newUser);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const e = email.trim().toLowerCase();
    const users = getAllUsers();
    const u = users.find(x => x.email === e);
    if (!u) throw new Error('No account with this email');
    const h = await sha256(password);
    if (h !== u.passwordHash) throw new Error('Incorrect password');
    setCurrentSession(u.id);
    broadcast();
    return toSafe(u);
  }, []);

  const signOut = useCallback(() => {
    setCurrentSession(null);
    broadcast();
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<StoredUser, 'displayName' | 'avatar'>>) => {
    const id = getCurrentSession();
    if (!id) return;
    const users = getAllUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...updates };
    saveAllUsers(users);
    broadcast();
  }, []);

  return { user, signUp, signIn, signOut, updateProfile };
};