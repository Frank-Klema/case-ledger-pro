/**
 * @fileoverview Type definitions for legal case management system.
 * Defines core types for cases, statuses, priorities, and related entities.
 */

/** Possible status values for a legal case */
export type CaseStatus = 'open' | 'pending' | 'closed' | 'archived';

/** Priority levels for cases, from lowest to highest urgency */
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

/** Categories of legal cases supported by the system */
export type CaseType = 'civil' | 'criminal' | 'family' | 'corporate' | 'property' | 'labor' | 'garnishee' | 'other';

/**
 * Additional details specific to garnishee proceedings.
 * Only applicable when case type is 'garnishee'.
 */
export interface GarnisheeDetails {
  /** Court handling the garnishee proceeding */
  garnisheeCourt: string;
  /** Name of the represented garnishee party */
  representedGarnishee: string;
  /** Additional comments or notes about the garnishee proceeding */
  garnisheeComment: string;
  /** Deadline date for the garnishee proceeding */
  garnisheeDeadline: string;
}

/**
 * Complete legal case entity with all metadata.
 * Represents a case stored in the system.
 */
export interface LegalCase {
  /** Unique identifier for the case */
  id: string;
  /** Official case number (e.g., CASE-2024-001) */
  caseNumber: string;
  /** Descriptive title of the case */
  title: string;
  /** Name of the client being represented */
  client: string;
  /** Name of the opposing party */
  opposingParty: string;
  /** Category/type of the legal case */
  type: CaseType;
  /** Current status of the case */
  status: CaseStatus;
  /** Priority level for handling the case */
  priority: CasePriority;
  /** Court where the case is being heard */
  court: string;
  /** Presiding judge's name */
  judge: string;
  /** Date when the case was filed */
  filingDate: string;
  /** Date of the next scheduled hearing */
  nextHearing: string;
  /** Brief description of the case */
  description: string;
  /** Additional notes about the case */
  notes: string;
  /** Whether copy of judgment or court order has been collected */
  judgmentCollected: boolean;
  /** Counsel that handled the matter on the last date */
  lastCounsel: string;
  /** Whether the case is archived */
  isArchived: boolean;
  /** Garnishee-specific fields (only for garnishee case type) */
  garnisheeDetails?: GarnisheeDetails;
  /** Timestamp when the case was created */
  createdAt: string;
  /** Timestamp when the case was last updated */
  updatedAt: string;
  /** Timestamp when the case was soft-deleted (null if not deleted) */
  deletedAt?: string | null;
}

/**
 * Form data structure for creating or editing a case.
 * Excludes system-generated fields like id, createdAt, and updatedAt.
 */
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
  /** Whether copy of judgment or court order has been collected */
  judgmentCollected: boolean;
  /** Counsel that handled the matter on the last date */
  lastCounsel: string;
  /** Whether the case is archived */
  isArchived: boolean;
  /** Garnishee-specific fields (only for garnishee case type) */
  garnisheeDetails?: GarnisheeDetails;
}

/**
 * Calendar event derived from case data.
 * Used for displaying hearings and deadlines in calendar view.
 */
export interface CalendarEvent {
  /** Unique identifier for the event */
  id: string;
  /** ID of the associated case */
  caseId: string;
  /** Case number for reference */
  caseNumber: string;
  /** Event title/description */
  title: string;
  /** Date of the event */
  date: Date;
  /** Type of calendar event */
  type: 'hearing' | 'deadline' | 'garnishee-deadline';
  /** Priority inherited from the case */
  priority: CasePriority;
  /** Court location (optional) */
  court?: string;
}
