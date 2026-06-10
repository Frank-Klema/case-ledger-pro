/**
 * @fileoverview Hook for managing legal cases — backed by Lovable Cloud.
 * Rows live in the `cases` table with the full LegalCase shape persisted
 * in the `data` JSONB column; a few common fields are mirrored as columns
 * so admin queries and indexes can hit them directly. RLS guarantees a
 * user only ever sees their own rows.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LegalCase, CaseFormData, CaseLog } from '@/types/case';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

const toJson = (c: LegalCase): Json => JSON.parse(JSON.stringify(c)) as Json;

type CaseRow = {
  id: string;
  user_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const rowToCase = (row: CaseRow): LegalCase => {
  const d = (row.data ?? {}) as Partial<LegalCase>;
  return {
    ...(d as LegalCase),
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    logs: (d.logs ?? []) as CaseLog[],
    judgmentCollected: d.judgmentCollected ?? false,
    lastCounsel: d.lastCounsel ?? '',
    isArchived: d.isArchived ?? false,
  };
};

/** Build the column payload to mirror common fields for queries/indexes. */
const mirrorCols = (c: Partial<LegalCase>) => ({
  case_number: c.caseNumber ?? null,
  case_title: c.title ?? null,
  court: c.court ?? null,
  status: c.status ?? null,
  judgment_collected: c.judgmentCollected ?? false,
  last_counsel: c.lastCounsel ?? null,
  is_archived: c.isArchived ?? false,
  next_hearing: c.nextHearing && /^\d{4}-\d{2}-\d{2}/.test(c.nextHearing) ? c.nextHearing.slice(0, 10) : null,
  notes: c.notes ?? null,
});

export const useCases = () => {
  const { user } = useAuth();
  const [allCases, setAllCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cases for the active user
  useEffect(() => {
    if (!user) { setAllCases([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select('id,user_id,data,created_at,updated_at,deleted_at')
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (error) console.error('Failed to load cases:', error);
        setAllCases((data ?? []).map(r => rowToCase(r as unknown as CaseRow)));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

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

  const addCase = useCallback((data: CaseFormData) => {
    if (!user) throw new Error('Not signed in');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newCase: LegalCase = {
      ...data,
      id,
      judgmentCollected: data.judgmentCollected ?? false,
      lastCounsel: data.lastCounsel ?? '',
      isArchived: data.isArchived ?? false,
      logs: data.logs ?? [],
      createdAt: now, updatedAt: now, deletedAt: null,
    };
    setAllCases(prev => [newCase, ...prev]);
    supabase.from('cases').insert({
      id, user_id: user.id, data: toJson(newCase), ...mirrorCols(newCase),
    }).then(({ error }) => { if (error) console.error('addCase failed:', error); });
    return newCase;
  }, [user]);

  const updateCase = useCallback((id: string, data: Partial<CaseFormData>) => {
    setAllCases(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c);
      const target = updated.find(c => c.id === id);
      if (target) {
        supabase.from('cases').update({
          data: toJson(target), ...mirrorCols(target),
        }).eq('id', id).then(({ error }) => { if (error) console.error('updateCase failed:', error); });
      }
      return updated;
    });
  }, []);

  const deleteCase = useCallback((id: string) => {
    const ts = new Date().toISOString();
    setAllCases(prev => prev.map(c => c.id === id ? { ...c, deletedAt: ts } : c));
    supabase.from('cases').update({ deleted_at: ts }).eq('id', id)
      .then(({ error }) => { if (error) console.error('deleteCase failed:', error); });
  }, []);

  const restoreCase = useCallback((id: string) => {
    setAllCases(prev => prev.map(c => c.id === id ? { ...c, deletedAt: null } : c));
    supabase.from('cases').update({ deleted_at: null }).eq('id', id)
      .then(({ error }) => { if (error) console.error('restoreCase failed:', error); });
  }, []);

  const permanentDeleteCase = useCallback((id: string) => {
    setAllCases(prev => prev.filter(c => c.id !== id));
    supabase.from('cases').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('permanentDeleteCase failed:', error); });
  }, []);

  const emptyBin = useCallback(() => {
    if (!user) return;
    setAllCases(prev => prev.filter(c => !c.deletedAt));
    supabase.from('cases').delete().eq('user_id', user.id).not('deleted_at', 'is', null)
      .then(({ error }) => { if (error) console.error('emptyBin failed:', error); });
  }, [user]);

  const restoreAllFromBin = useCallback(() => {
    if (!user) return;
    setAllCases(prev => prev.map(c => c.deletedAt ? { ...c, deletedAt: null } : c));
    supabase.from('cases').update({ deleted_at: null }).eq('user_id', user.id).not('deleted_at', 'is', null)
      .then(({ error }) => { if (error) console.error('restoreAllFromBin failed:', error); });
  }, [user]);

  const importCases = useCallback((importedCases: CaseFormData[]) => {
    if (!user) return 0;
    const now = new Date().toISOString();
    const newCases: LegalCase[] = importedCases.map(data => ({
      ...data,
      id: crypto.randomUUID(),
      judgmentCollected: data.judgmentCollected ?? false,
      lastCounsel: data.lastCounsel ?? '',
      isArchived: data.isArchived ?? false,
      logs: data.logs ?? [],
      createdAt: now, updatedAt: now, deletedAt: null,
    }));
    setAllCases(prev => [...newCases, ...prev]);
    const payload = newCases.map(c => ({
      id: c.id, user_id: user.id, data: toJson(c), ...mirrorCols(c),
    }));
    supabase.from('cases').insert(payload)
      .then(({ error }) => { if (error) console.error('importCases failed:', error); });
    return newCases.length;
  }, [user]);

  const addCaseLog = useCallback((id: string, entry: Omit<CaseLog, 'id' | 'createdAt'>) => {
    setAllCases(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const log: CaseLog = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        const newLastCounsel = entry.counsel || c.lastCounsel;
        const newNextHearing = entry.adjournedTo ? entry.adjournedTo : c.nextHearing;
        return {
          ...c, logs: [log, ...(c.logs ?? [])],
          lastCounsel: newLastCounsel, nextHearing: newNextHearing,
          updatedAt: new Date().toISOString(),
        };
      });
      const target = updated.find(c => c.id === id);
      if (target) {
        supabase.from('cases').update({
          data: toJson(target), ...mirrorCols(target),
        }).eq('id', id).then(({ error }) => { if (error) console.error('addCaseLog failed:', error); });
      }
      return updated;
    });
  }, []);

  const setArchived = (id: string, isArchived: boolean) => {
    setAllCases(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isArchived, updatedAt: new Date().toISOString() } : c);
      const target = updated.find(c => c.id === id);
      if (target) {
        supabase.from('cases').update({ data: toJson(target), is_archived: isArchived })
          .eq('id', id).then(({ error }) => { if (error) console.error('archive failed:', error); });
      }
      return updated;
    });
  };
  const archiveCase = useCallback((id: string) => setArchived(id, true), []);
  const unarchiveCase = useCallback((id: string) => setArchived(id, false), []);

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
    cases.filter(c => !c.judgmentCollected && c.status === 'closed'), 
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
