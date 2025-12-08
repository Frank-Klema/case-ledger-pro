/**
 * @fileoverview Custom hook for managing legal cases state and operations.
 * Provides CRUD operations for cases with localStorage persistence.
 */

import { useState, useEffect, useCallback } from 'react';
import { LegalCase, CaseFormData } from '@/types/case';
import { getCases, saveCases, deleteCase as removeCase } from '@/lib/storage';

/**
 * Hook for managing legal cases with persistent storage.
 * Handles loading, adding, updating, deleting, and importing cases.
 * 
 * @returns Object containing cases array, loading state, and CRUD functions
 */
export const useCases = () => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cases from storage on mount
  useEffect(() => {
    const loadCases = () => {
      const storedCases = getCases();
      setCases(storedCases);
      setLoading(false);
    };
    loadCases();
  }, []);

  /**
   * Adds a new case to the collection.
   * Generates a unique ID and timestamps automatically.
   * 
   * @param data - Case form data for the new case
   * @returns The newly created LegalCase object
   */
  const addCase = useCallback((data: CaseFormData) => {
    const newCase: LegalCase = {
      ...data,
      id: crypto.randomUUID(),
      judgmentCollected: data.judgmentCollected ?? false,
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

  /**
   * Updates an existing case with new data.
   * Automatically updates the updatedAt timestamp.
   * 
   * @param id - ID of the case to update
   * @param data - Partial case data to merge
   */
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

  /**
   * Deletes a case by its ID.
   * 
   * @param id - ID of the case to delete
   */
  const deleteCase = useCallback((id: string) => {
    setCases(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveCases(updated);
      return updated;
    });
  }, []);

  /**
   * Imports multiple cases from external data.
   * Useful for bulk import from Excel files.
   * 
   * @param importedCases - Array of case form data to import
   * @returns Number of cases successfully imported
   */
  const importCases = useCallback((importedCases: CaseFormData[]) => {
    const newCases: LegalCase[] = importedCases.map(data => ({
      ...data,
      id: crypto.randomUUID(),
      judgmentCollected: data.judgmentCollected ?? false,
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
