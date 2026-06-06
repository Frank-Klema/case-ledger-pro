import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MoreVertical, Eye, Pencil, Trash2, FileCheck, FileX, Archive, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { LegalCase, CaseStatus } from '@/types/case';
import { CaseStatusBadge, CasePriorityBadge } from './CaseStatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DashboardFilter } from '@/components/dashboard/Dashboard';
import { useSettings } from '@/hooks/useSettings';
import { formatDate } from '@/lib/date';

type SortField = 'createdAt' | 'caseNumber' | 'title' | 'garnishee' | 'judgmentCreditor' | 'nextHearing' | 'filingDate' | 'court';
type SortOrder = 'asc' | 'desc';

interface CaseListProps {
  cases: LegalCase[];
  onView: (caseItem: LegalCase) => void;
  onEdit: (caseItem: LegalCase) => void;
  onDelete: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
  onArchive?: (id: string) => void;
  onBatchArchive?: (ids: string[]) => void;
  initialFilter?: DashboardFilter;
  showArchived?: boolean;
}

export const CaseList = ({
  cases, onView, onEdit, onDelete, onBatchDelete, onArchive, onBatchArchive, initialFilter, showArchived = false,
}: CaseListProps) => {
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const casesPerPage = settings.casesPerPage;

  useEffect(() => {
    if (initialFilter) {
      if (initialFilter === 'all' || initialFilter === 'archived' || initialFilter === 'pendingJudgment') {
        setStatusFilter('all');
        setPriorityFilter('all');
      } else if (initialFilter === 'urgent') {
        setStatusFilter('all');
        setPriorityFilter('urgent');
      } else {
        setStatusFilter(initialFilter as CaseStatus);
        setPriorityFilter('all');
      }
    }
  }, [initialFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const filteredAndSortedCases = useMemo(() => {
    let result = cases.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        (c.garnishee || '').toLowerCase().includes(q) ||
        (c.judgmentCreditor || '').toLowerCase().includes(q) ||
        (c.judgmentDebtor || '').toLowerCase().includes(q) ||
        c.court.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      const matchesArchived = showArchived ? c.isArchived : !c.isArchived;
      return matchesSearch && matchesStatus && matchesPriority && matchesArchived;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case 'caseNumber': comparison = a.caseNumber.localeCompare(b.caseNumber); break;
        case 'title': comparison = a.title.localeCompare(b.title); break;
        case 'garnishee': comparison = (a.garnishee || '').localeCompare(b.garnishee || ''); break;
        case 'judgmentCreditor': comparison = (a.judgmentCreditor || '').localeCompare(b.judgmentCreditor || ''); break;
        case 'court': comparison = a.court.localeCompare(b.court); break;
        case 'nextHearing': {
          const dA = a.nextHearing ? new Date(a.nextHearing).getTime() : 0;
          const dB = b.nextHearing ? new Date(b.nextHearing).getTime() : 0;
          comparison = dA - dB; break;
        }
        case 'filingDate': {
          const dA = a.filingDate ? new Date(a.filingDate).getTime() : 0;
          const dB = b.filingDate ? new Date(b.filingDate).getTime() : 0;
          comparison = dA - dB; break;
        }
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [cases, search, statusFilter, priorityFilter, sortField, sortOrder, showArchived]);

  const totalPages = Math.ceil(filteredAndSortedCases.length / casesPerPage);
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * casesPerPage;
    return filteredAndSortedCases.slice(startIndex, startIndex + casesPerPage);
  }, [filteredAndSortedCases, currentPage, casesPerPage]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedCases.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginatedCases.map(c => c.id)));
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const handleBatchDelete = () => {
    if (onBatchDelete) onBatchDelete(Array.from(selectedIds));
    else selectedIds.forEach(id => onDelete(id));
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  };

  const handleBatchArchive = () => {
    if (onBatchArchive) onBatchArchive(Array.from(selectedIds));
    else if (onArchive) selectedIds.forEach(id => onArchive(id));
    setSelectedIds(new Set());
    setArchiveDialogOpen(false);
  };

  const allSelected = paginatedCases.length > 0 && selectedIds.size === paginatedCases.length;

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-foreground' : 'text-muted-foreground'}`} />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <>
              {onArchive && !showArchived && (
                <Button variant="outline" size="sm" onClick={() => setArchiveDialogOpen(true)}>
                  <Archive className="mr-2 h-5 w-5" />
                  Archive {selectedIds.size} selected
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-5 w-5" />
                Delete {selectedIds.size} selected
              </Button>
            </>
          )}
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Added</SelectItem>
              <SelectItem value="caseNumber">Case Number</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="garnishee">Garnishee</SelectItem>
              <SelectItem value="judgmentCreditor">Order Creditor</SelectItem>
              <SelectItem value="court">Court</SelectItem>
              <SelectItem value="nextHearing">Next Hearing</SelectItem>
              <SelectItem value="filingDate">Date Filed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline" size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
          </Button>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CaseStatus | 'all')}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-5 w-5" />
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
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
              </TableHead>
              <SortableHeader field="caseNumber">Case Number</SortableHeader>
              <SortableHeader field="title">Title</SortableHeader>
              <SortableHeader field="garnishee">Garnishee</SortableHeader>
              <SortableHeader field="court">Court</SortableHeader>
              <TableHead className="font-semibold">Status</TableHead>
              {!showArchived && <TableHead className="font-semibold">Priority</TableHead>}
              <TableHead className="font-semibold">Order</TableHead>
              {!showArchived && <SortableHeader field="nextHearing">Next Hearing</SortableHeader>}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showArchived ? 8 : 10} className="h-32 text-center text-muted-foreground">
                  {cases.length === 0 ? 'No cases yet. Add your first case to get started.' : 'No cases match your filters.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCases.map((caseItem) => (
                <TableRow
                  key={caseItem.id}
                  className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedIds.has(caseItem.id) ? 'bg-muted/40' : ''}`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('[role="checkbox"]') ||
                        (e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]') ||
                        (e.target as HTMLElement).closest('button')) return;
                    onView(caseItem);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(caseItem.id)}
                      onCheckedChange={() => toggleSelect(caseItem.id)}
                      aria-label={`Select ${caseItem.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{caseItem.caseNumber}</TableCell>
                  <TableCell className="font-medium">{caseItem.title}</TableCell>
                  <TableCell>{caseItem.garnishee || '-'}</TableCell>
                  <TableCell>{caseItem.court || '-'}</TableCell>
                  <TableCell><CaseStatusBadge status={caseItem.status} /></TableCell>
                  {!showArchived && <TableCell><CasePriorityBadge priority={caseItem.priority} /></TableCell>}
                  <TableCell>
                    {caseItem.judgmentCollected ? (
                      <span className="inline-flex items-center gap-1.5 text-success">
                        <FileCheck className="h-5 w-5" />
                        <span className="text-sm">Collected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <FileX className="h-5 w-5" />
                        <span className="text-sm">Not Collected</span>
                      </span>
                    )}
                  </TableCell>
                  {!showArchived && (
                    <TableCell className="text-foreground">{formatDate(caseItem.nextHearing)}</TableCell>
                  )}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(caseItem)}>
                          <Eye className="mr-2 h-5 w-5" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(caseItem)}>
                          <Pencil className="mr-2 h-5 w-5" /> Edit
                        </DropdownMenuItem>
                        {onArchive && !caseItem.isArchived && (
                          <DropdownMenuItem onClick={() => onArchive(caseItem.id)}>
                            <Archive className="mr-2 h-5 w-5" /> Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSingleDeleteId(caseItem.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-5 w-5" /> Move to Bin
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedCases.length} of {filteredAndSortedCases.length} cases
          {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move {selectedIds.size} cases to bin?</AlertDialogTitle>
            <AlertDialogDescription>These cases will be moved to the bin. You can restore them later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Move to Bin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!singleDeleteId} onOpenChange={(open) => !open && setSingleDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move this case to bin?</AlertDialogTitle>
            <AlertDialogDescription>This case will be moved to the bin. You can restore it later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (singleDeleteId) { onDelete(singleDeleteId); setSingleDeleteId(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Move to Bin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedIds.size} cases?</AlertDialogTitle>
            <AlertDialogDescription>These cases will be moved to the archive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};