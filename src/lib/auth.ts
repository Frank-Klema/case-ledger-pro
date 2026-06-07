/**
 * Local-only auth: users stored in localStorage. Passwords hashed with SHA-256.
 * The very first registered user is auto-promoted to admin; afterwards admin
 * status can be edited directly in localStorage (`legalcase-users`).
 */

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  avatar?: string; // data-URL
  isAdmin: boolean;
  createdAt: string;
}

export interface SafeUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
}

const USERS_KEY = 'legalcase-users';
const SESSION_KEY = 'legalcase-session';

export const sha256 = async (text: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const getAllUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveAllUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const toSafe = (u: StoredUser): SafeUser => ({
  id: u.id, email: u.email, displayName: u.displayName,
  avatar: u.avatar, isAdmin: u.isAdmin, createdAt: u.createdAt,
});

export const getCurrentSession = (): string | null => localStorage.getItem(SESSION_KEY);
export const setCurrentSession = (id: string | null) => {
  if (id) localStorage.setItem(SESSION_KEY, id);
  else localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUserId = (): string | null => getCurrentSession();

/** Per-user storage key helper. Falls back to "_guest" when nobody is signed in. */
export const userKey = (base: string): string => {
  const id = getCurrentUserId() || '_guest';
  return `${base}::${id}`;
};