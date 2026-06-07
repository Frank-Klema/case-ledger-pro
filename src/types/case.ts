/**
 * @fileoverview Type definitions for the garnishee case management system.
 */

export type CaseStatus = 'open' | 'closed' | 'archived';
export type CasePriority = 'normal' | 'urgent';

export type CaseLogType = 'note';

export interface CaseLog {
  id: string;
  /** Date of this log entry / the case date. */
  date: string;
  /** Always 'note' in the new model (indorsement / note). */
  type: CaseLogType;
  /** Counsel who handled this date */
  counsel: string;
  /** Indorsement / free-form note text */
  note: string;
  /** If adjourned: the date adjourned to (ISO yyyy-mm-dd). When set this also
   *  becomes the case's new Next Hearing. */
  adjournedTo?: string;
  /** Whether an update on this entry should be communicated to the represented garnishee. */
  updateToGarnishee?: boolean;
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
  /** Court — may include judge details as a sub-line. */
  court: string;
  filingDate: string;
  nextHearing: string;
  description: string;
  notes: string;
  judgmentCollected: boolean;
  lastCounsel: string;
  isArchived: boolean;
  logs: CaseLog[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  /** Legacy fields — kept optional for migration. */
  judge?: string;
  garnisheeDeadline?: string;
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
