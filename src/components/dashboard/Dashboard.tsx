import { Briefcase, Clock, AlertTriangle, Hourglass } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { CaseStatusChart } from './CaseStatusChart';
import { LegalCase } from '@/types/case';
import { formatDate } from '@/lib/date';

export type DashboardFilter = 'all' | 'open' | 'pending' | 'closed' | 'urgent' | 'archived' | 'pendingJudgment';

interface DashboardProps {
  cases: LegalCase[];
  archivedCases?: LegalCase[];
  pendingJudgmentCases?: LegalCase[];
  onFilterSelect?: (filter: DashboardFilter) => void;
  onCaseClick?: (caseItem: LegalCase) => void;
}

export const Dashboard = ({
  cases, archivedCases = [], pendingJudgmentCases = [], onFilterSelect, onCaseClick,
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

  const upcomingHearings = cases
    .filter(c => c.nextHearing && new Date(c.nextHearing) >= new Date() && c.status !== 'closed' && !c.isArchived)
    .sort((a, b) => new Date(a.nextHearing).getTime() - new Date(b.nextHearing).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Cases" value={stats.total} icon={Briefcase} variant="primary" onClick={() => onFilterSelect?.('all')} />
        <StatsCard title="Open Cases" value={stats.open} icon={Clock} variant="warning" onClick={() => onFilterSelect?.('open')} />
        <StatsCard title="Pending Cases" value={stats.pending} icon={Hourglass} variant="default" onClick={() => onFilterSelect?.('pending')} />
        <StatsCard title="Urgent Cases" value={stats.urgent} icon={AlertTriangle} variant="destructive" onClick={() => onFilterSelect?.('urgent')} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
                    <p className="text-sm font-medium text-foreground">{formatDate(c.nextHearing)}</p>
                    <p className="text-xs text-muted-foreground">Next Hearing</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-slide-up">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Case Status Distribution</h3>
          <CaseStatusChart cases={activeCases} />
        </div>
      </div>
    </div>
  );
};