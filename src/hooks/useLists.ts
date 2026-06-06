import { useState, useEffect, useCallback } from 'react';

/** Generic editable string-list hook backed by localStorage. */
const makeListHook = (key: string) => () => {
  const read = (): string[] => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const [items, setItems] = useState<string[]>(read);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [items]);

  const add = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems(prev =>
      prev.some(c => c.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, trimmed].sort((a, b) => a.localeCompare(b))
    );
  }, []);

  const remove = useCallback((name: string) => {
    setItems(prev => prev.filter(c => c !== name));
  }, []);

  return { items, add, remove };
};

export const useGarnishees = makeListHook('legalcase-garnishees');
export const useCourts = makeListHook('legalcase-courts');
export const useJudges = makeListHook('legalcase-judges');