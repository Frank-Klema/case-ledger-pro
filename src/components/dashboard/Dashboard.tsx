import { Briefcase, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { LegalCase } from '@/types/case';

interface DashboardProps {
  cases: LegalCase[];
}

export const Dashboard = ({ cases }: DashboardProps) => {
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Cases"
          value={stats.total}
          icon={Briefcase}
          variant="primary"
        />
        <StatsCard
          title="Open Cases"
          value={stats.open}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Closed Cases"
          value={stats.closed}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Urgent Cases"
          value={stats.urgent}
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

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
    </div>
  );
};
