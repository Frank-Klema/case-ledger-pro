import { LegalCase, CasePriority, CaseStatus } from '@/types/case';
import { getCurrentUserId } from '@/lib/auth';

const STORAGE_BASE = 'legal_cases';
const SCHEMA_KEY = 'legal_cases_schema_version';
/** Bump when the LegalCase shape changes in an incompatible way. */
const CURRENT_SCHEMA = 3;

const keyFor = (userId: string) => `${STORAGE_BASE}::${userId}`;

const ensureSchema = () => {
  const v = localStorage.getItem(SCHEMA_KEY);
  if (v !== String(CURRENT_SCHEMA)) {
    // Schema bump — wipe legacy unscoped key and all per-user case stores.
    localStorage.removeItem(STORAGE_BASE);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_BASE + '::')) localStorage.removeItem(k);
    }
    localStorage.setItem(SCHEMA_KEY, String(CURRENT_SCHEMA));
  }
};

/** Coerce legacy values to the current type (idempotent). */
const normalize = (c: LegalCase): LegalCase => {
  const status: CaseStatus = (['open', 'closed', 'archived'] as const).includes(c.status as any)
    ? (c.status as CaseStatus)
    : 'open';
  const priority: CasePriority = c.priority === 'urgent' ? 'urgent' : 'normal';
  return { ...c, status, priority };
};

const currentUser = (): string => getCurrentUserId() || '_guest';

export const getCases = (): LegalCase[] => getCasesForUser(currentUser());
export const saveCases = (cases: LegalCase[]): void => saveCasesForUser(currentUser(), cases);

export const getCasesForUser = (userId: string): LegalCase[] => {
  try {
    ensureSchema();
    const data = localStorage.getItem(keyFor(userId));
    const parsed: LegalCase[] = data ? JSON.parse(data) : [];
    return parsed.map(normalize);
  } catch (error) {
    console.error('Error reading cases from storage:', error);
    return [];
  }
};

export const saveCasesForUser = (userId: string, cases: LegalCase[]): void => {
  try {
    ensureSchema();
    localStorage.setItem(keyFor(userId), JSON.stringify(cases));
  } catch (error) {
    console.error('Error saving cases to storage:', error);
  }
};