import { useEffect, useMemo, useState } from 'react';
import { Users, MessageSquare, Briefcase, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useFeedback } from '@/hooks/useFeedback';
import { formatDate, formatDateTime } from '@/lib/date';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  open: 'hsl(var(--warning))',
  closed: 'hsl(180 60% 40%)',
  archived: 'hsl(var(--muted-foreground))',
};

interface AdminUser {
  id: string; email: string | null; displayName: string;
  createdAt: string; isAdmin: boolean;
}
interface AdminCase {
  id: string; user_id: string; status: string | null;
  is_archived: boolean; created_at: string; deleted_at: string | null;
  data: { priority?: string } | null;
}

export const AdminPanel = () => {
  const { items: feedback, remove } = useFeedback();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [cases, setCases] = useState<AdminCase[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: roles }, { data: caseRows }] = await Promise.all([
        supabase.from('profiles').select('id,email,display_name,created_at'),
        supabase.from('user_roles').select('user_id,role'),
        supabase.from('cases').select('id,user_id,status,is_archived,created_at,deleted_at,data'),
      ]);
      const adminIds = new Set((roles ?? []).filter(r => r.role === 'admin').map(r => r.user_id));
      setUsers((profiles ?? []).map(p => ({
        id: p.id, email: p.email, displayName: p.display_name || (p.email ?? 'User'),
        createdAt: p.created_at, isAdmin: adminIds.has(p.id),
      })));
      setCases((caseRows ?? []) as AdminCase[]);
    })();
  }, []);

  const perUserCases = useMemo(() =>
    users.map(u => ({ user: u, cases: cases.filter(c => c.user_id === u.id) })),
    [users, cases]);

  const allCases = useMemo(() => cases.filter(c => !c.deleted_at), [cases]);

  const totals = {
    users: users.length,
    cases: allCases.length,
    open: allCases.filter(c => c.status === 'open' && !c.isArchived).length,
    closed: allCases.filter(c => c.status === 'closed').length,
    urgent: allCases.filter(c => c.data?.priority === 'urgent').length,
    archived: allCases.filter(c => c.is_archived).length,
    feedback: feedback.length,
    newFeedback: feedback.length,
  };

  const statusData = [
    { name: 'Open', value: totals.open, status: 'open' },
    { name: 'Closed', value: totals.closed, status: 'closed' },
    { name: 'Archived', value: totals.archived, status: 'archived' },
  ];

  // Per-user chart
  const perUserData = perUserCases.map(({ user, cases }) => ({
    name: user.displayName,
    cases: cases.filter(c => !c.deleted_at).length,
  })).sort((a, b) => b.cases - a.cases).slice(0, 12);

  // Cases over time (by createdAt month)
  const byMonth = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of allCases) {
      const key = c.created_at.slice(0, 7); // YYYY-MM
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
                  <td className="py-2 pr-3">{cases.filter(c => !c.deleted_at).length}</td>
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
                    <p className="font-medium">
                      {users.find(u => u.id === f.userId)?.displayName ?? 'Unknown user'}
                      {f.category && <span className="ml-2 text-xs text-muted-foreground">[{f.category}]</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(f.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
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