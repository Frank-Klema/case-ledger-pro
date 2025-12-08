/**
 * @fileoverview Bin/Trash list component for soft-deleted cases.
 * Shows deleted cases with options to restore or permanently delete.
 */

import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { LegalCase } from '@/types/case';
import { CaseStatusBadge, CasePriorityBadge } from './CaseStatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

interface BinListProps {
  /** Array of deleted cases */
  deletedCases: LegalCase[];
  /** Callback to restore a case */
  onRestore: (id: string) => void;
  /** Callback to permanently delete a case */
  onPermanentDelete: (id: string) => void;
  /** Callback to empty the entire bin */
  onEmptyBin: () => void;
  /** Callback to restore all cases */
  onRestoreAll: () => void;
}

export const BinList = ({ 
  deletedCases, 
  onRestore, 
  onPermanentDelete, 
  onEmptyBin,
  onRestoreAll 
}: BinListProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emptyBinDialogOpen, setEmptyBinDialogOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.size === deletedCases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deletedCases.map(c => c.id)));
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
    selectedIds.forEach(id => onPermanentDelete(id));
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  };

  const handleBatchRestore = () => {
    selectedIds.forEach(id => onRestore(id));
    setSelectedIds(new Set());
  };

  const handleSingleDelete = () => {
    if (singleDeleteId) {
      onPermanentDelete(singleDeleteId);
      setSingleDeleteId(null);
    }
  };

  const handleEmptyBin = () => {
    onEmptyBin();
    setEmptyBinDialogOpen(false);
  };

  const allSelected = deletedCases.length > 0 && selectedIds.size === deletedCases.length;

  const formatDeletedDate = (deletedAt?: string | null) => {
    if (!deletedAt) return '-';
    return new Date(deletedAt).toLocaleDateString();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trash2 className="h-5 w-5" />
          <span className="text-sm">
            {deletedCases.length} {deletedCases.length === 1 ? 'case' : 'cases'} in bin
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBatchRestore}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Restore {selectedIds.size} selected
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete permanently
              </Button>
            </>
          )}
          {deletedCases.length > 0 && selectedIds.size === 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRestoreAll}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Restore All
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setEmptyBinDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Empty Bin
              </Button>
            </>
          )}
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
                  disabled={deletedCases.length === 0}
                />
              </TableHead>
              <TableHead className="font-semibold">Case Number</TableHead>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Deleted On</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deletedCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Trash2 className="h-8 w-8 opacity-50" />
                    <span>Bin is empty</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              deletedCases.map((caseItem) => (
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
                  <TableCell className="text-muted-foreground">
                    {formatDeletedDate(caseItem.deletedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRestore(caseItem.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setSingleDeleteId(caseItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Batch delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Permanently delete {selectedIds.size} cases?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. These cases will be permanently removed and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBatchDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single delete confirmation */}
      <AlertDialog open={!!singleDeleteId} onOpenChange={(open) => !open && setSingleDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Permanently delete this case?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This case will be permanently removed and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSingleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty bin confirmation */}
      <AlertDialog open={emptyBinDialogOpen} onOpenChange={setEmptyBinDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Empty the bin?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {deletedCases.length} cases in the bin. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEmptyBin} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Empty Bin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
