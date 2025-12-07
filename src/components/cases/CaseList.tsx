import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { LegalCase, CaseStatus, CaseType } from '@/types/case';
import { CaseStatusBadge, CasePriorityBadge } from './CaseStatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DashboardFilter } from '@/components/dashboard/Dashboard';

interface CaseListProps {
  cases: LegalCase[];
  onView: (caseItem: LegalCase) => void;
  onEdit: (caseItem: LegalCase) => void;
  onDelete: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
  initialFilter?: DashboardFilter;
}

export const CaseList = ({ cases, onView, onEdit, onDelete, onBatchDelete, initialFilter }: CaseListProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Apply initial filter from dashboard
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter === 'all') {
        setStatusFilter('all');
        setPriorityFilter('all');
      } else if (initialFilter === 'urgent') {
        setStatusFilter('all');
        setPriorityFilter('urgent');
      } else {
        setStatusFilter(initialFilter);
        setPriorityFilter('all');
      }
    }
  }, [initialFilter]);

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCases.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchDelete = () => {
    if (onBatchDelete) {
      onBatchDelete(Array.from(selectedIds));
    } else {
      selectedIds.forEach(id => onDelete(id));
    }
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  };

  const allSelected = filteredCases.length > 0 && selectedIds.size === filteredCases.length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {selectedIds.size} selected
            </Button>
          )}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CaseStatus | 'all')}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as CaseType | 'all')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="civil">Civil</SelectItem>
              <SelectItem value="criminal">Criminal</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="labor">Labor</SelectItem>
              <SelectItem value="garnishee">Garnishee</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="font-semibold">Case Number</TableHead>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Next Hearing</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  {cases.length === 0 ? 'No cases yet. Add your first case to get started.' : 'No cases match your filters.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((caseItem) => (
                <TableRow 
                  key={caseItem.id} 
                  className={`hover:bg-muted/30 transition-colors ${selectedIds.has(caseItem.id) ? 'bg-muted/40' : ''}`}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.has(caseItem.id)}
                      onCheckedChange={() => toggleSelect(caseItem.id)}
                      aria-label={`Select ${caseItem.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-accent">{caseItem.caseNumber}</TableCell>
                  <TableCell className="font-medium">{caseItem.title}</TableCell>
                  <TableCell>{caseItem.client}</TableCell>
                  <TableCell className="capitalize">{caseItem.type}</TableCell>
                  <TableCell><CaseStatusBadge status={caseItem.status} /></TableCell>
                  <TableCell><CasePriorityBadge priority={caseItem.priority} /></TableCell>
                  <TableCell>
                    {caseItem.nextHearing ? new Date(caseItem.nextHearing).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(caseItem)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(caseItem)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(caseItem.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredCases.length} of {cases.length} cases
        {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
      </p>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} cases?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
