/**
 * @fileoverview Pie chart component for visualizing case status distribution.
 * Displays a donut chart showing the breakdown of cases by status.
 */

import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { LegalCase } from '@/types/case';

/**
 * Props for the CaseStatusChart component.
 */
interface CaseStatusChartProps {
  /** Array of legal cases to visualize */
  cases: LegalCase[];
}

/**
 * Color mapping for each case status.
 * Uses semantic colors from the design system.
 */
const STATUS_COLORS: Record<string, string> = {
  open: 'hsl(var(--warning))',
  pending: 'hsl(var(--muted-foreground))',
  closed: 'hsl(180 60% 40%)', // Teal color
  archived: 'hsl(var(--accent))',
};

/**
 * Human-readable labels for case statuses.
 */
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  pending: 'Pending',
  closed: 'Closed',
  archived: 'Archived',
};

/**
 * Renders a bar chart showing the distribution of cases by status.
 * Each status gets a coloured bar with an interactive tooltip on hover.
 *
 * @param props - Component props containing cases array
 * @returns JSX element with the bar chart visualization
 */
export const CaseStatusChart = ({ cases }: CaseStatusChartProps) => {
  // Tally how many cases fall in each status bucket.
  const statusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Always render all four statuses (zero counts included) so the axes stay stable.
  const chartData = (['open', 'pending', 'closed', 'archived'] as const).map(status => ({
    name: STATUS_LABELS[status],
    value: statusCounts[status] || 0,
    status,
  }));

  if (cases.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No case data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: number) => [`${value} cases`, 'Count']}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || 'hsl(var(--muted))'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
