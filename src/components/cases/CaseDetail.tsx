import { useState } from 'react';
import { LegalCase, CaseLog } from '@/types/case';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CaseStatusBadge } from './CaseStatusBadge';
import { formatDate, formatDateTime } from '@/lib/date';
import { useCounsels } from '@/hooks/useCounsels';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Plus, MessageSquare, AlertCircle } from 'lucide-react';

interface CaseDetailProps {
  open: boolean;
  onClose: () => void;
  caseItem: LegalCase | null;
  onEdit: () => void;
  onAddLog: (id: string, entry: Omit<CaseLog, 'id' | 'createdAt'>) => void;
}

/**
 * Case detail dialog. Shows full case info and the chronological case log.
 * 
 * FEATURES:
 * - Logs are indorsements/notes with proceeding date (when it happened)
 * - proceedingDate: The actual court calendar date (REQUIRED, <= today)
 * - counsel: Who handled the case (REQUIRED, must be selected)
 * - Optional adjournedTo date becomes the case's new nextHearing automatically
 * - Future dates prevented via max={today} constraint
 * - Counsel validation enforced with toast error if missing
 * 
 * SECURITY:
 * - Counsel field marked required with visual enforcement
 * - Future date input blocked at HTML level
 * - All counsel selections validated before submission
 */
export const CaseDetail = ({ open, onClose, caseItem, onEdit, onAddLog }: CaseDetailProps) => {
  const { counsels } = useCounsels();
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [logDate, setLogDate] = useState(today);
  const [logCounsel, setLogCounsel] = useState('');
  const [logNote, setLogNote] = useState('');
  const [logAdjournedTo, setLogAdjournedTo] = useState('');
  const [garnisheeStatus, setGarnisheeStatus] = useState<string>('');
  const [garnisheeUpdateDate, setGarnisheeUpdateDate] = useState('');
  const [filterCounsel, setFilterCounsel] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  if (!caseItem) return null;

  const resetForm = () => {
    setLogDate(new Date().toISOString().slice(0, 10));
    setLogCounsel('');
    setLogNote('');
    setLogAdjournedTo('');
    setGarnisheeStatus('');
    setGarnisheeUpdateDate('');
  };

  /**
   * Validates and submits a new log entry.
   * REQUIRED FIELDS:
   * - proceedingDate (set as logDate, validated as <= today)
   * - counsel (MUST be selected, non-empty)
   * At least one of {note, adjournedTo} must be provided.
   */
  const handleAddLog = () => {
    // Validate counsel—REQUIRED field for accountability
    if (!logCounsel || !logCounsel.trim()) {
      toast({
        title: 'Counsel Required',
        description: 'Please select the counsel who handled this proceeding. This is required for audit trail and accountability.',
        variant: 'destructive',
      });
      return;
    }

    // Validate at least one of note or adjournedTo is provided
    if (!logNote.trim() && !logAdjournedTo) {
      toast({
        title: 'Entry Incomplete',
        description: 'Please provide either a note or an adjourned date.',
        variant: 'destructive',
      });
      return;
    }

    // Validate proceeding date is not in future
    if (logDate > today) {
      toast({
        title: 'Invalid Proceeding Date',
        description: 'Proceeding date cannot be in the future.',
        variant: 'destructive',
      });
      return;
    }

    onAddLog(caseItem.id, {
      proceedingDate: logDate || today,
      type: 'note',
      counsel: logCounsel,
      note: logNote.trim(),
      adjournedTo: logAdjournedTo || undefined,
      garnisheeUpdateStatus: garnisheeStatus as any || undefined,
      garnisheeUpdateDate: garnisheeUpdateDate || undefined,
    });
    resetForm();
    toast({
      title: 'Log Entry Added',
      description: `Added entry for ${formatDate(logDate)} with counsel ${logCounsel}`,
    });
  };

  const logs = caseItem.logs ?? [];

  /**
   * Apply filters to logs:
   * - Filter by counsel
   * - Filter by date range (proceedingDate)
   * - Search by note content
   */
  const filteredLogs = logs.filter((l) => {
    if (filterCounsel && l.counsel !== filterCounsel) return false;
    if (filterDateFrom && l.proceedingDate < filterDateFrom) return false;
    if (filterDateTo && l.proceedingDate > filterDateTo) return false;
    if (searchText && !l.note.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  /**
   * Get badge color for garnishee status
   */
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'sent':
        return 'bg-blue-500 text-white';
      case 'acknowledged':
        return 'bg-green-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="font-heading text-2xl">
                {caseItem.title || caseItem.caseNumber}
              </DialogTitle>
              <DialogDescription>
                Case No. {caseItem.caseNumber}
              </DialogDescription>
            </div>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <CaseStatusBadge status={caseItem.status} />
          <Badge variant={caseItem.priority === 'urgent' ? 'destructive' : 'secondary'}>
            {caseItem.priority === 'urgent' ? 'Urgent' : 'Normal'}
          </Badge>
          {caseItem.isArchived && <Badge variant="outline">Archived</Badge>}
          {caseItem.judgmentCollected && <Badge className="bg-success text-success-foreground">Order Collected</Badge>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mt-2">
          <Field label="Judgment Creditor" value={caseItem.judgmentCreditor} />
          <Field label="Judgment Debtor" value={caseItem.judgmentDebtor} />
          <Field label="Garnishee" value={caseItem.garnishee} />
          <Field label="Court" value={caseItem.court} />
          <Field label="Date Filed" value={formatDate(caseItem.filingDate)} />
          <Field label="Next Hearing" value={formatDate(caseItem.nextHearing)} />
          <Field label="Last Counsel" value={caseItem.lastCounsel} />
        </div>

        {caseItem.description && (
          <div className="mt-2">
            <p className="text-xs uppercase text-muted-foreground mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap">{caseItem.description}</p>
          </div>
        )}
        {caseItem.notes && (
          <div className="mt-2">
            <p className="text-xs uppercase text-muted-foreground mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{caseItem.notes}</p>
          </div>
        )}

        <Separator className="my-4" />

        {/* Case log */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="font-heading text-lg font-semibold">Case Log</h3>
          </div>

          {/* Log entry form */}
          <div className="rounded-lg border border-border p-4 space-y-4 bg-muted/30 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-2 flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                <strong>Counsel is required</strong> on every log entry for accountability and audit trail.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="log-date" className="text-xs font-semibold">Proceeding Date *</Label>
                <p className="text-xs text-muted-foreground mb-1">When the hearing actually took place</p>
                <Input
                  id="log-date"
                  type="date"
                  value={logDate}
                  max={today}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="border-blue-200"
                />
                {logDate > today && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Cannot be in the future</p>
                )}
              </div>
              <div>
                <Label htmlFor="log-adj" className="text-xs font-semibold">Adjourned To (optional)</Label>
                <p className="text-xs text-muted-foreground mb-1">Next hearing date if adjourned</p>
                <Input
                  id="log-adj"
                  type="date"
                  value={logAdjournedTo}
                  onChange={(e) => setLogAdjournedTo(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Counsel *</Label>
              <p className="text-xs text-muted-foreground mb-1">Required: Who handled this proceeding</p>
              <Select value={logCounsel} onValueChange={setLogCounsel}>
                <SelectTrigger className={logCounsel ? 'border-green-300' : 'border-red-300'}>
                  <SelectValue placeholder="Select counsel (required)" />
                </SelectTrigger>
                <SelectContent>
                  {counsels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {logCounsel && (
                <p className="text-xs text-green-600 mt-1">✓ {logCounsel} selected</p>
              )}
            </div>

            <div>
              <Label htmlFor="log-note" className="text-xs font-semibold">Indorsement / Note</Label>
              <p className="text-xs text-muted-foreground mb-1">What happened on this date?</p>
              <Textarea
                id="log-note"
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                placeholder="Describe the proceedings..."
                className="min-h-[80px]"
              />
            </div>

            {/* Garnishee status tracking */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Garnishee Update Status</Label>
                <p className="text-xs text-muted-foreground mb-1">Track communication lifecycle</p>
                <Select value={garnisheeStatus} onValueChange={setGarnisheeStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {garnisheeStatus && (
                <div>
                  <Label htmlFor="garnishee-date" className="text-xs font-semibold">Status Update Date</Label>
                  <p className="text-xs text-muted-foreground mb-1">When status changed</p>
                  <Input
                    id="garnishee-date"
                    type="date"
                    value={garnisheeUpdateDate}
                    onChange={(e) => setGarnisheeUpdateDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddLog}
                disabled={!logNote.trim() && !logAdjournedTo}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" /> Add to Log
              </Button>
            </div>
          </div>

          {/* Log filtering */}
          <div className="rounded-lg border border-border p-3 mb-4 bg-slate-50 space-y-3">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Filter Logs</h4>
            <div className="grid sm:grid-cols-4 gap-2">
              <div>
                <Label className="text-xs">By Counsel</Label>
                <Select value={filterCounsel} onValueChange={setFilterCounsel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Counsels</SelectItem>
                    {counsels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  placeholder="From"
                />
              </div>
              <div>
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  placeholder="To"
                />
              </div>
              <div>
                <Label className="text-xs">Search Notes</Label>
                <Input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>

          {/* Log entries display */}
          <div className="mt-4 space-y-3">
            {filteredLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {logs.length === 0 ? 'No log entries yet.' : 'No matching log entries.'}
              </p>
            ) : (
              filteredLogs.map((l) => (
                <div key={l.id} className="rounded-lg border border-border p-3 bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-blue-700">{formatDate(l.proceedingDate)}</span>
                      {l.counsel && (
                        <span className="text-muted-foreground">· <strong>{l.counsel}</strong></span>
                      )}
                      {l.adjournedTo && (
                        <Badge variant="outline" className="bg-orange-50">Adjourned to {formatDate(l.adjournedTo)}</Badge>
                      )}
                      {l.garnisheeUpdateStatus && (
                        <Badge className={getStatusColor(l.garnisheeUpdateStatus)}>
                          {l.garnisheeUpdateStatus}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDateTime(l.createdAt)}</span>
                  </div>
                  {l.note && <p className="text-sm whitespace-pre-wrap text-slate-700">{l.note}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs uppercase text-muted-foreground">{label}</p>
    <p className="font-medium">{value || '-'}</p>
  </div>
);
