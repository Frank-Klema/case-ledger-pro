export type CaseStatus = 'open' | 'pending' | 'closed' | 'archived';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type CaseType = 'civil' | 'criminal' | 'family' | 'corporate' | 'property' | 'labor' | 'other';

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  client: string;
  opposingParty: string;
  type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  court: string;
  judge: string;
  filingDate: string;
  nextHearing: string;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseFormData {
  caseNumber: string;
  title: string;
  client: string;
  opposingParty: string;
  type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  court: string;
  judge: string;
  filingDate: string;
  nextHearing: string;
  description: string;
  notes: string;
}
