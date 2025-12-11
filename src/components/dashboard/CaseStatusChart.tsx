/**
 * @fileoverview Pie chart component for visualizing case status distribution.
 * Displays a donut chart showing the breakdown of cases by status.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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
 * Renders a donut chart showing the distribution of cases by status.
 * Includes interactive tooltips and a legend.
 * 
 * @param props - Component props containing cases array
 * @returns JSX element with the pie chart visualization
 */
export const CaseStatusChart = ({ cases }: CaseStatusChartProps) => {
  // Calculate counts for each status
  const statusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Transform to chart data format
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    status,
  }));

  // Don't render if no data
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No case data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={4}
          dataKey="value"
          label={false}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={STATUS_COLORS[entry.status] || 'hsl(var(--muted))'}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: number, name: string) => [`${value} cases`, name]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={(value) => (
            <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
