import { useState, useEffect, useCallback } from 'react';

const KEY = 'legalcase-counsels';

const read = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/** Editable list of counsels used in the Last Counsel selector. */
export const useCounsels = () => {
  const [counsels, setCounsels] = useState<string[]>(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(counsels));
  }, [counsels]);

  const addCounsel = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCounsels(prev =>
      prev.some(c => c.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, trimmed].sort((a, b) => a.localeCompare(b))
    );
  }, []);

  const removeCounsel = useCallback((name: string) => {
    setCounsels(prev => prev.filter(c => c !== name));
  }, []);

  return { counsels, addCounsel, removeCounsel };
};