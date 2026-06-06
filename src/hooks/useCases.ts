/**
 * @fileoverview Custom hook for managing legal cases state and operations.
 * Provides CRUD operations for cases with localStorage persistence.
 * Includes soft-delete functionality with bin/trash support.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LegalCase, CaseFormData, CaseLog } from '@/types/case';
import { getCases, saveCases } from '@/lib/storage';

/**
 * Hook for managing legal cases with persistent storage.
 * Handles loading, adding, updating, deleting, and importing cases.
 * Supports soft-delete with restore and permanent delete functionality.
 * 
 * @returns Object containing cases array, loading state, and CRUD functions
 */
export const useCases = () => {
  const [allCases, setAllCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cases from storage on mount
  useEffect(() => {
    const loadCases = () => {
      const storedCases = getCases();
      setAllCases(storedCases);
      setLoading(false);
    };
    loadCases();
  }, []);

  /** Active (non-deleted) cases */
  const cases = useMemo(() => 
    allCases.filter(c => !c.deletedAt), 
    [allCases]
  );

  /** Soft-deleted cases in the bin */
  const deletedCases = useMemo(() => 
    allCases.filter(c => !!c.deletedAt), 
    [allCases]
  );

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
      lastCounsel: data.lastCounsel ?? '',
      isArchived: data.isArchived ?? false,
      logs: data.logs ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    setAllCases(prev => {
      // Add new case at the beginning so it appears at the top
      const updated = [newCase, ...prev];
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
    setAllCases(prev => {
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
   * Soft-deletes a case by setting its deletedAt timestamp.
   * The case moves to the bin and can be restored.
   * 
   * @param id - ID of the case to soft-delete
   */
  const deleteCase = useCallback((id: string) => {
    setAllCases(prev => {
      const updated = prev.map(c => 
        c.id === id 
          ? { ...c, deletedAt: new Date().toISOString() }
          : c
      );
      saveCases(updated);
      return updated;
    });
  }, []);

  /**
   * Restores a soft-deleted case from the bin.
   * 
   * @param id - ID of the case to restore
   */
  const restoreCase = useCallback((id: string) => {
    setAllCases(prev => {
      const updated = prev.map(c => 
        c.id === id 
          ? { ...c, deletedAt: null, updatedAt: new Date().toISOString() }
          : c
      );
      saveCases(updated);
      return updated;
    });
  }, []);

  /**
   * Permanently deletes a case from the bin.
   * This action cannot be undone.
   * 
   * @param id - ID of the case to permanently delete
   */
  const permanentDeleteCase = useCallback((id: string) => {
    setAllCases(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveCases(updated);
      return updated;
    });
  }, []);

  /**
   * Permanently deletes all cases in the bin.
   * This action cannot be undone.
   */
  const emptyBin = useCallback(() => {
    setAllCases(prev => {
      const updated = prev.filter(c => !c.deletedAt);
      saveCases(updated);
      return updated;
    });
  }, []);

  /**
   * Restores all soft-deleted cases from the bin.
   */
  const restoreAllFromBin = useCallback(() => {
    setAllCases(prev => {
      const updated = prev.map(c => 
        c.deletedAt 
          ? { ...c, deletedAt: null, updatedAt: new Date().toISOString() }
          : c
      );
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
      lastCounsel: data.lastCounsel ?? '',
      isArchived: data.isArchived ?? false,
      logs: data.logs ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }));
    setAllCases(prev => {
      // Add new cases at the beginning so they appear at the top
      const updated = [...newCases, ...prev];
      saveCases(updated);
      return updated;
    });
    return newCases.length;
  }, []);

  /** Append a log entry (adjournment, indorsement, or note) to a case. */
  const addCaseLog = useCallback((id: string, entry: Omit<CaseLog, 'id' | 'createdAt'>) => {
    setAllCases(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const log: CaseLog = {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        const newLastCounsel = entry.counsel || c.lastCounsel;
        // Any log with an Adjourned Date updates the case's Next Hearing,
        // so it instantly reflects on the calendar / dashboard / lists.
        const newNextHearing = entry.adjournedTo ? entry.adjournedTo : c.nextHearing;
        return {
          ...c,
          logs: [log, ...(c.logs ?? [])],
          lastCounsel: newLastCounsel,
          nextHearing: newNextHearing,
          updatedAt: new Date().toISOString(),
        };
      });
      saveCases(updated);
      return updated;
    });
  }, []);

  /**
   * Archives a case by setting isArchived to true.
   * 
   * @param id - ID of the case to archive
   */
  const archiveCase = useCallback((id: string) => {
    setAllCases(prev => {
      const updated = prev.map(c => 
        c.id === id 
          ? { ...c, isArchived: true, updatedAt: new Date().toISOString() }
          : c
      );
      saveCases(updated);
      return updated;
    });
  }, []);

  /**
   * Unarchives a case by setting isArchived to false.
   * 
   * @param id - ID of the case to unarchive
   */
  const unarchiveCase = useCallback((id: string) => {
    setAllCases(prev => {
      const updated = prev.map(c => 
        c.id === id 
          ? { ...c, isArchived: false, updatedAt: new Date().toISOString() }
          : c
      );
      saveCases(updated);
      return updated;
    });
  }, []);

  /** Active (non-deleted, non-archived) cases */
  const activeCases = useMemo(() => 
    cases.filter(c => !c.isArchived), 
    [cases]
  );

  /** Archived cases */
  const archivedCases = useMemo(() => 
    cases.filter(c => c.isArchived), 
    [cases]
  );

  /** Cases with judgment/order not yet collected */
  const pendingJudgmentCases = useMemo(() => 
    cases.filter(c => !c.judgmentCollected && (c.status === 'closed' || c.status === 'pending')), 
    [cases]
  );

  return {
    cases,
    activeCases,
    archivedCases,
    pendingJudgmentCases,
    deletedCases,
    loading,
    addCase,
    updateCase,
    deleteCase,
    restoreCase,
    permanentDeleteCase,
    emptyBin,
    restoreAllFromBin,
    importCases,
    archiveCase,
    unarchiveCase,
    addCaseLog,
  };
};
