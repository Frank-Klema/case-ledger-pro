/**
 * @fileoverview Type definitions for the garnishee case management system.
 * 
 * SECURITY & VALIDATION NOTES:
 * - All dates are ISO 8601 strings (YYYY-MM-DD format)
 * - Counsel field is REQUIRED on every log entry for audit trail
 * - proceedingDate must be <= today (no future dates)
 * - Garnishee update status tracks communication lifecycle
 */

export type CaseStatus = 'open' | 'closed' | 'archived';
export type CasePriority = 'normal' | 'urgent';
export type CaseLogType = 'note';

/**
 * Status of garnishee communication update for a case log entry.
 * Tracks the lifecycle of garnishee notification:
 * - pending: Update identified but not yet sent
 * - sent: Update transmitted to garnishee
 * - acknowledged: Garnishee confirmed receipt
 * - failed: Transmission failed or rejected
 * 
 * SECURITY: Use discriminated union for type safety in status transitions.
 */
export type GarnisheeUpdateStatus = 'pending' | 'sent' | 'acknowledged' | 'failed';

/**
 * A single chronological entry in a case log.
 * 
 * REQUIRED FIELDS:
 * - proceedingDate: The actual date the hearing occurred (court calendar date)
 * - counsel: The attorney who handled the case that day (accountability/audit)
 * 
 * VALIDATION RULES:
 * - proceedingDate: ISO YYYY-MM-DD format, must be <= today
 * - counsel: Non-empty string, selected from counsels dropdown
 * - At least one of {note, adjournedTo} must be provided
 * - adjournedTo: If set, updates the case's nextHearing automatically
 * 
 * TIMESTAMPS:
 * - proceedingDate: When the court event happened
 * - createdAt: When this log entry was recorded (audit trail, auto-generated)
 */
export interface CaseLog {
  id: string;
  
  /**
   * The actual date the proceeding/hearing took place on the court calendar.
   * REQUIRED. Format: YYYY-MM-DD (ISO 8601).
   * VALIDATION: Must be <= today (no future dates allowed).
   * This is NOT the date the entry was recorded—see createdAt for that.
   */
  proceedingDate: string;
  
  /** 
   * Always 'note' in the new model (indorsement / note).
   * Reserved for future expansion to 'order', 'judgment', etc.
   */
  type: CaseLogType;
  
  /**
   * The counsel who handled this proceeding on proceedingDate.
   * REQUIRED. Must be selected from counsels dropdown before submission.
   * ENFORCED: handleAddLog() will reject empty counsel with toast error.
   * PURPOSE: Ensures accountability and enables filtering/audit trail.
   */
  counsel: string;
  
  /** 
   * Indorsement / free-form note text describing what happened.
   * Optional if adjournedTo is provided. At least one must exist.
   */
  note: string;
  
  /** 
   * If adjourned: the date adjourned to (ISO YYYY-MM-DD).
   * When set, this becomes the case's new nextHearing automatically.
   * Optional—only set if case was adjourned.
   */
  adjournedTo?: string;
  
  /** 
   * DEPRECATED: Legacy field for garnishee update flag.
   * Use garnisheeUpdateStatus instead for better lifecycle tracking.
   * Kept for backward compatibility with existing data.
   */
  updateToGarnishee?: boolean;
  
  /**
   * Current status of garnishee communication for this entry.
   * Tracks the lifecycle: pending → sent → acknowledged (or failed).
   * Only set if a garnishee update is relevant.
   * SECURITY: Type-safe enum prevents invalid status values.
   */
  garnisheeUpdateStatus?: GarnisheeUpdateStatus;
  
  /**
   * Date the garnishee update was last actioned (sent/acknowledged/failed).
   * Format: YYYY-MM-DD (ISO 8601). Optional—only set if status changed.
   * AUDIT: Helps track when garnishee notifications were sent/received.
   */
  garnisheeUpdateDate?: string;
  
  /**
   * Timestamp when this log entry was created/recorded.
   * AUTO-GENERATED: Set automatically to current timestamp.
   * Format: ISO 8601 timestamp (e.g., 2025-06-08T14:30:00Z).
   * AUDIT: Distinguishes "when it happened" (proceedingDate) from 
   *        "when we recorded it" (createdAt). Critical for audit trails.
   */
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
