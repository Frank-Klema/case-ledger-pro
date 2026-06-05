/**
 * @fileoverview Type definitions for the garnishee case management system.
 */

export type CaseStatus = 'open' | 'pending' | 'closed' | 'archived';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export type CaseLogType = 'adjournment' | 'indorsement' | 'note';

export interface CaseLog {
  id: string;
  /** Date the event occurred (ISO yyyy-mm-dd) */
  date: string;
  type: CaseLogType;
  /** Counsel who handled this date */
  counsel: string;
  /** Free-form note: indorsement text, etc. */
  note: string;
  /** If adjourned: the date adjourned to (ISO yyyy-mm-dd) */
  adjournedTo?: string;
  createdAt: string;
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  /** Judgment creditor */
  judgmentCreditor: string;
  /** Judgment debtor */
  judgmentDebtor: string;
  /** Represented garnishee */
  garnishee: string;
  status: CaseStatus;
  priority: CasePriority;
  court: string;
  judge: string;
  filingDate: string;
  nextHearing: string;
  garnisheeDeadline: string;
  description: string;
  notes: string;
  judgmentCollected: boolean;
  lastCounsel: string;
  isArchived: boolean;
  logs: CaseLog[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type CaseFormData = Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'logs'> & {
  logs?: CaseLog[];
};

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
