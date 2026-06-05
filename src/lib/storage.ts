import { LegalCase } from '@/types/case';

const STORAGE_KEY = 'legal_cases';
const SCHEMA_KEY = 'legal_cases_schema_version';
/** Bump when the LegalCase shape changes in an incompatible way. */
const CURRENT_SCHEMA = 2;

const ensureSchema = () => {
  const v = localStorage.getItem(SCHEMA_KEY);
  if (v !== String(CURRENT_SCHEMA)) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(SCHEMA_KEY, String(CURRENT_SCHEMA));
  }
};

export const getCases = (): LegalCase[] => {
  try {
    ensureSchema();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading cases from storage:', error);
    return [];
  }
};

export const saveCases = (cases: LegalCase[]): void => {
  try {
    ensureSchema();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (error) {
    console.error('Error saving cases to storage:', error);
  }
};

export const addCase = (caseData: LegalCase): void => {
  const cases = getCases();
  cases.push(caseData);
  saveCases(cases);
};

export const updateCase = (id: string, updates: Partial<LegalCase>): void => {
  const cases = getCases();
  const index = cases.findIndex(c => c.id === id);
  if (index !== -1) {
    cases[index] = { ...cases[index], ...updates, updatedAt: new Date().toISOString() };
    saveCases(cases);
  }
};

export const deleteCase = (id: string): void => {
  const cases = getCases().filter(c => c.id !== id);
  saveCases(cases);
};

export const getCaseById = (id: string): LegalCase | undefined => {
  return getCases().find(c => c.id === id);
};
