/**
 * @fileoverview Dashboard component displaying case statistics and overview.
 * Provides a quick summary of case counts, upcoming hearings, and visual charts.
 */

import { Briefcase, Clock, CheckCircle, AlertTriangle, Hourglass, Archive, FileX } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { CaseStatusChart } from './CaseStatusChart';
import { LegalCase } from '@/types/case';

/** Filter options for the dashboard stats cards */
export type DashboardFilter = 'all' | 'open' | 'pending' | 'closed' | 'urgent' | 'archived' | 'pendingJudgment';

/**
 * Props for the Dashboard component.
 */
interface DashboardProps {
  /** Array of all legal cases */
  cases: LegalCase[];
  /** Array of archived cases */
  archivedCases?: LegalCase[];
  /** Array of cases with pending judgment collection */
  pendingJudgmentCases?: LegalCase[];
  /** Callback when a filter card is clicked */
  onFilterSelect?: (filter: DashboardFilter) => void;
  /** Callback when a case is clicked */
  onCaseClick?: (caseItem: LegalCase) => void;
}

/**
 * Main dashboard component showing case statistics and overview.
 * Displays stats cards, upcoming hearings, pending cases, and status chart.
 * 
 * @param props - Component props
 * @returns JSX element with the complete dashboard layout
 */
export const Dashboard = ({ 
  cases, 
  archivedCases = [], 
  pendingJudgmentCases = [],
  onFilterSelect,
  onCaseClick 
}: DashboardProps) => {
  const activeCases = cases.filter(c => !c.isArchived);
  
  const stats = {
    total: activeCases.length,
    open: activeCases.filter(c => c.status === 'open').length,
    pending: activeCases.filter(c => c.status === 'pending').length,
    closed: activeCases.filter(c => c.status === 'closed').length,
    urgent: activeCases.filter(c => c.priority === 'urgent').length,
    archived: archivedCases.length,
    pendingJudgment: pendingJudgmentCases.length,
  };

  // Only show upcoming hearings for non-closed and non-archived cases
  const upcomingHearings = cases
    .filter(c => c.nextHearing && 
      new Date(c.nextHearing) >= new Date() && 
      c.status !== 'closed' && 
      !c.isArchived)
    .sort((a, b) => new Date(a.nextHearing).getTime() - new Date(b.nextHearing).getTime())
    .slice(0, 5);

  const pendingCases = cases
    .filter(c => c.status === 'pending' && !c.isArchived)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatsCard
          title="Total Cases"
          value={stats.total}
          icon={Briefcase}
          variant="primary"
          onClick={() => onFilterSelect?.('all')}
        />
        <StatsCard
          title="Open Cases"
          value={stats.open}
          icon={Clock}
          variant="warning"
          onClick={() => onFilterSelect?.('open')}
        />
        <StatsCard
          title="Pending Cases"
          value={stats.pending}
          icon={Hourglass}
          variant="default"
          onClick={() => onFilterSelect?.('pending')}
        />
        <StatsCard
          title="Closed Cases"
          value={stats.closed}
          icon={CheckCircle}
          variant="success"
          onClick={() => onFilterSelect?.('closed')}
        />
        <StatsCard
          title="Urgent Cases"
          value={stats.urgent}
          icon={AlertTriangle}
          variant="destructive"
          onClick={() => onFilterSelect?.('urgent')}
        />
        <StatsCard
          title="Archived"
          value={stats.archived}
          icon={Archive}
          variant="default"
          onClick={() => onFilterSelect?.('archived')}
        />
        <StatsCard
          title="Judgment Pending"
          value={stats.pendingJudgment}
          icon={FileX}
          variant="warning"
          onClick={() => onFilterSelect?.('pendingJudgment')}
        />
      </div>

      {/* Secondary grid: Upcoming hearings, pending cases, pending judgments, and status chart */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {/* Upcoming Hearings Panel */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-slide-up">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Upcoming Hearings</h3>
          <div className="space-y-3">
            {upcomingHearings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming hearings</p>
            ) : (
              upcomingHearings.map(c => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => onCaseClick?.(c)}
                >
                  <div>
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.caseNumber} • {c.court}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{new Date(c.nextHearing).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Next Hearing</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Cases Panel */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-slide-up">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Pending Cases</h3>
          <div className="space-y-3">
            {pendingCases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending cases</p>
            ) : (
              pendingCases.map(c => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => onCaseClick?.(c)}
                >
                  <div>
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.caseNumber} • {c.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-warning">{c.type}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Judgment Collection Panel */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-slide-up">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Judgments to Collect</h3>
          <div className="space-y-3">
            {pendingJudgmentCases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All judgments collected</p>
            ) : (
              pendingJudgmentCases.slice(0, 5).map(c => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => onCaseClick?.(c)}
                >
                  <div>
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.caseNumber} • {c.court}</p>
                  </div>
                  <div className="text-right">
                    <FileX className="h-5 w-5 text-warning" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Case Status Distribution Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-slide-up">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Case Status Distribution</h3>
          <CaseStatusChart cases={activeCases} />
        </div>
      </div>
    </div>
  );
};