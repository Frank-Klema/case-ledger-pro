import { LegalCase } from '@/types/case';

const STORAGE_KEY = 'legal_cases';

export const getCases = (): LegalCase[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading cases from storage:', error);
    return [];
  }
};

export const saveCases = (cases: LegalCase[]): void => {
  try {
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
