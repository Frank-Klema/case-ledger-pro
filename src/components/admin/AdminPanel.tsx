import { useMemo } from 'react';
import { Users, MessageSquare, Briefcase, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { getAllUsers, toSafe } from '@/lib/auth';
import { getCasesForUser } from '@/lib/storage';
import { useFeedback } from '@/hooks/useFeedback';
import { formatDate, formatDateTime } from '@/lib/date';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { LegalCase } from '@/types/case';

const STATUS_COLORS: Record<string, string> = {
  open: 'hsl(var(--warning))',
  closed: 'hsl(180 60% 40%)',
  archived: 'hsl(var(--muted-foreground))',
};

/**
 * Admin panel — visible only to users flagged `isAdmin`. Aggregates cases
 * across every locally-registered user and surfaces the feedback inbox.
 */
export const AdminPanel = () => {
  const users = getAllUsers().map(toSafe);
  const { items: feedback, setStatus, remove } = useFeedback();

  const perUserCases: { user: typeof users[number]; cases: LegalCase[] }[] = useMemo(
    () => users.map(u => ({ user: u, cases: getCasesForUser(u.id) })),
    [users],
  );

  const allCases = useMemo(() => perUserCases.flatMap(x => x.cases.filter(c => !c.deletedAt)), [perUserCases]);

  const totals = {
    users: users.length,
    cases: allCases.length,
    open: allCases.filter(c => c.status === 'open' && !c.isArchived).length,
    closed: allCases.filter(c => c.status === 'closed').length,
    urgent: allCases.filter(c => c.priority === 'urgent').length,
    archived: allCases.filter(c => c.isArchived).length,
    feedback: feedback.length,
    newFeedback: feedback.filter(f => f.status !== 'resolved').length,
  };

  const statusData = [
    { name: 'Open', value: totals.open, status: 'open' },
    { name: 'Closed', value: totals.closed, status: 'closed' },
    { name: 'Archived', value: totals.archived, status: 'archived' },
  ];

  // Per-user chart
  const perUserData = perUserCases.map(({ user, cases }) => ({
    name: user.displayName,
    cases: cases.filter(c => !c.deletedAt).length,
  })).sort((a, b) => b.cases - a.cases).slice(0, 12);

  // Cases over time (by createdAt month)
  const byMonth = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of allCases) {
      const key = c.createdAt.slice(0, 7); // YYYY-MM
      m.set(key, (m.get(key) || 0) + 1);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [allCases]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={totals.users} icon={Users} variant="primary" />
        <StatsCard title="Total Cases" value={totals.cases} icon={Briefcase} variant="default" />
        <StatsCard title="Urgent Cases" value={totals.urgent} icon={Briefcase} variant="destructive" />
        <StatsCard title="Feedback Items" value={totals.feedback} icon={MessageSquare} variant="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-lg font-semibold mb-4">Cases by status (all users)</h3>
          {allCases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No cases yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {statusData.map(d => <Cell key={d.status} fill={STATUS_COLORS[d.status]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-lg font-semibold mb-4">Top users by case count</h3>
          {perUserData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={perUserData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="font-heading text-lg font-semibold mb-4">Cases added over time</h3>
          {byMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-heading text-lg font-semibold mb-4">Registered users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Joined</th>
                <th className="py-2 pr-3">Cases</th>
                <th className="py-2 pr-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {perUserCases.map(({ user, cases }) => (
                <tr key={user.id} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-medium">{user.displayName}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{user.email}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="py-2 pr-3">{cases.filter(c => !c.deletedAt).length}</td>
                  <td className="py-2 pr-3">
                    {user.isAdmin ? <Badge>Admin</Badge> : <Badge variant="secondary">User</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Feedback inbox
          {totals.newFeedback > 0 && (
            <span className="ml-2 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-xs">
              {totals.newFeedback} pending
            </span>
          )}
        </h3>
        {feedback.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No feedback yet</p>
        ) : (
          <div className="space-y-3">
            {feedback.map(f => (
              <div key={f.id} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-medium">{f.userDisplayName} <span className="text-xs text-muted-foreground">({f.userEmail})</span></p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(f.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={f.status === 'resolved' ? 'secondary' : 'default'}>{f.status}</Badge>
                    {f.status !== 'resolved' && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(f.id, 'resolved')}>
                        <Check className="h-3 w-3" /> Resolve
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove(f.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{f.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};