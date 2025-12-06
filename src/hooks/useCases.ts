import { useState, useEffect, useCallback } from 'react';
import { LegalCase, CaseFormData } from '@/types/case';
import { getCases, saveCases, deleteCase as removeCase } from '@/lib/storage';

export const useCases = () => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = () => {
      const storedCases = getCases();
      setCases(storedCases);
      setLoading(false);
    };
    loadCases();
  }, []);

  const addCase = useCallback((data: CaseFormData) => {
    const newCase: LegalCase = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCases(prev => {
      const updated = [...prev, newCase];
      saveCases(updated);
      return updated;
    });
    return newCase;
  }, []);

  const updateCase = useCallback((id: string, data: Partial<CaseFormData>) => {
    setCases(prev => {
      const updated = prev.map(c => 
        c.id === id 
          ? { ...c, ...data, updatedAt: new Date().toISOString() }
          : c
      );
      saveCases(updated);
      return updated;
    });
  }, []);

  const deleteCase = useCallback((id: string) => {
    setCases(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveCases(updated);
      return updated;
    });
  }, []);

  const importCases = useCallback((importedCases: CaseFormData[]) => {
    const newCases: LegalCase[] = importedCases.map(data => ({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setCases(prev => {
      const updated = [...prev, ...newCases];
      saveCases(updated);
      return updated;
    });
    return newCases.length;
  }, []);

  return {
    cases,
    loading,
    addCase,
    updateCase,
    deleteCase,
    importCases,
  };
};
