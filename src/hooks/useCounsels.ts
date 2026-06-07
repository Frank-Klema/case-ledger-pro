import { useState, useEffect, useCallback, useMemo } from 'react';
import { userKey } from '@/lib/auth';

const read = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

/** Editable, per-user list of counsels used in the Last Counsel selector. */
export const useCounsels = () => {
  const key = useMemo(() => userKey('legalcase-counsels'), []);
  const [counsels, setCounsels] = useState<string[]>(() => read(key));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(counsels));
  }, [counsels, key]);

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