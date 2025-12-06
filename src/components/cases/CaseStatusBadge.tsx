import { cn } from '@/lib/utils';
import { CaseStatus, CasePriority } from '@/types/case';

interface StatusBadgeProps {
  status: CaseStatus;
}

const statusStyles: Record<CaseStatus, string> = {
  open: 'bg-warning/10 text-warning border-warning/20',
  pending: 'bg-primary/10 text-primary border-primary/20',
  closed: 'bg-success/10 text-success border-success/20',
  archived: 'bg-muted text-muted-foreground border-border',
};

export const CaseStatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
      statusStyles[status]
    )}>
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: CasePriority;
}

const priorityStyles: Record<CasePriority, string> = {
  low: 'bg-muted text-muted-foreground border-border',
  medium: 'bg-primary/10 text-primary border-primary/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const CasePriorityBadge = ({ priority }: PriorityBadgeProps) => {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
      priorityStyles[priority]
    )}>
      {priority}
    </span>
  );
};
