import { useCallback, useEffect, useState } from 'react';

export interface FeedbackItem {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  message: string;
  rating?: number;
  status: 'new' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
}

const KEY = 'legalcase-feedback';

const read = (): FeedbackItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
const save = (items: FeedbackItem[]) => localStorage.setItem(KEY, JSON.stringify(items));

/**
 * Shared feedback inbox stored in localStorage. Visible to admins through the
 * admin panel; submissions are simulated-acknowledged immediately.
 */
export const useFeedback = () => {
  const [items, setItems] = useState<FeedbackItem[]>(read);

  useEffect(() => {
    const refresh = () => setItems(read());
    window.addEventListener('storage', refresh);
    window.addEventListener('legalcase-feedback-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('legalcase-feedback-changed', refresh);
    };
  }, []);

  const submit = useCallback((entry: Omit<FeedbackItem, 'id' | 'createdAt' | 'status' | 'acknowledgedAt'>) => {
    const all = read();
    const item: FeedbackItem = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
    };
    const next = [item, ...all];
    save(next); setItems(next);
    window.dispatchEvent(new Event('legalcase-feedback-changed'));
    return item;
  }, []);

  const setStatus = useCallback((id: string, status: FeedbackItem['status']) => {
    const next = read().map(f => f.id === id ? { ...f, status } : f);
    save(next); setItems(next);
    window.dispatchEvent(new Event('legalcase-feedback-changed'));
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter(f => f.id !== id);
    save(next); setItems(next);
    window.dispatchEvent(new Event('legalcase-feedback-changed'));
  }, []);

  return { items, submit, setStatus, remove };
};