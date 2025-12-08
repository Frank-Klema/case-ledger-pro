/**
 * @fileoverview Dashboard component displaying case statistics and overview.
 * Provides a quick summary of case counts, upcoming hearings, and visual charts.
 */

import { Briefcase, Clock, CheckCircle, AlertTriangle, Hourglass } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { CaseStatusChart } from './CaseStatusChart';
import { LegalCase } from '@/types/case';

/** Filter options for the dashboard stats cards */
export type DashboardFilter = 'all' | 'open' | 'pending' | 'closed' | 'urgent';

/**
 * Props for the Dashboard component.
 */
interface DashboardProps {
  /** Array of all legal cases */
  cases: LegalCase[];
  /** Callback when a filter card is clicked */
  onFilterSelect?: (filter: DashboardFilter) => void;
}

/**
 * Main dashboard component showing case statistics and overview.
 * Displays stats cards, upcoming hearings, pending cases, and status chart.
 * 
 * @param props - Component props
 * @returns JSX element with the complete dashboard layout
 */
export const Dashboard = ({ cases, onFilterSelect }: DashboardProps) => {
  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    pending: cases.filter(c => c.status === 'pending').length,
    closed: cases.filter(c => c.status === 'closed').length,
    urgent: cases.filter(c => c.priority === 'urgent').length,
  };

  const upcomingHearings = cases
    .filter(c => c.nextHearing && new Date(c.nextHearing) >= new Date())
    .sort((a, b) => new Date(a.nextHearing).getTime() - new Date(b.nextHearing).getTime())
    .slice(0, 5);

  const pendingCases = cases
    .filter(c => c.status === 'pending')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
      </div>

      {/* Secondary grid: Upcoming hearings, pending cases, and status chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Hearings Panel */}
        {upcomingHearings.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-slide-up">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Upcoming Hearings</h3>
            <div className="space-y-3">
              {upcomingHearings.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.caseNumber} • {c.court}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-accent">{new Date(c.nextHearing).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Next Hearing</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Cases Panel */}
        {pendingCases.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-slide-up">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Pending Cases</h3>
            <div className="space-y-3">
              {pendingCases.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.caseNumber} • {c.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-warning">{c.type}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case Status Distribution Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-slide-up">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Case Status Distribution</h3>
          <CaseStatusChart cases={cases} />
        </div>
      </div>
    </div>
  );
};