/**
 * Auth helpers — backed by Lovable Cloud (Supabase).
 * We keep a tiny mirror of the active user's id in localStorage so legacy
 * synchronous helpers (`getCurrentUserId`, `userKey`) keep working without
 * forcing every caller to become async.
 */

export interface SafeUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
}

const SESSION_KEY = 'legalcase-active-uid';

export const setCachedUserId = (id: string | null) => {
  if (id) localStorage.setItem(SESSION_KEY, id);
  else localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUserId = (): string | null =>
  localStorage.getItem(SESSION_KEY);

/** Per-user storage key helper. Falls back to "_guest" when nobody is signed in. */
export const userKey = (base: string): string => {
  const id = getCurrentUserId() || '_guest';
  return `${base}::${id}`;
};