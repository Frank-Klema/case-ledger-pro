export type CaseStatus = 'open' | 'pending' | 'closed' | 'archived';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type CaseType = 'civil' | 'criminal' | 'family' | 'corporate' | 'property' | 'labor' | 'garnishee' | 'other';

export interface GarnisheeDetails {
  garnisheeCourt: string;
  representedGarnishee: string;
  garnisheeComment: string;
  garnisheeDeadline: string;
}

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
  // Garnishee specific fields
  garnisheeDetails?: GarnisheeDetails;
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
  // Garnishee specific fields
  garnisheeDetails?: GarnisheeDetails;
}

export interface CalendarEvent {
  id: string;
  caseId: string;
  caseNumber: string;
  title: string;
  date: Date;
  type: 'hearing' | 'deadline' | 'garnishee-deadline';
  priority: CasePriority;
  court?: string;
}
