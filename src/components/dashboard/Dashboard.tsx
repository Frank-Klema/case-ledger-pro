import { Briefcase, Clock, CheckCircle, AlertTriangle, Hourglass } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { LegalCase } from '@/types/case';

export type DashboardFilter = 'all' | 'open' | 'pending' | 'closed' | 'urgent';

interface DashboardProps {
  cases: LegalCase[];
  onFilterSelect?: (filter: DashboardFilter) => void;
}

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

      <div className="grid gap-6 lg:grid-cols-2">
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
      </div>
    </div>
  );
};