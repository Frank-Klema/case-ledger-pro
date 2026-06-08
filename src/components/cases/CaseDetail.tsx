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
import { Pencil, Plus, MessageSquare } from 'lucide-react';

interface CaseDetailProps {
  open: boolean;
  onClose: () => void;
  caseItem: LegalCase | null;
  onEdit: () => void;
  onAddLog: (id: string, entry: Omit<CaseLog, 'id' | 'createdAt'>) => void;
}

/**
 * Case detail dialog. Shows full case info and the chronological case log.
 * Logs are indorsements/notes. The log Date is the date of the case (defaults
 * to today). The optional Adjourned Date, if set, becomes the case's new
 * Next Hearing date automatically.
 */
export const CaseDetail = ({ open, onClose, caseItem, onEdit, onAddLog }: CaseDetailProps) => {
  const { counsels } = useCounsels();
  const today = new Date().toISOString().slice(0, 10);
  const [logDate, setLogDate] = useState(today);
  const [logCounsel, setLogCounsel] = useState('');
  const [logNote, setLogNote] = useState('');
  const [logAdjournedTo, setLogAdjournedTo] = useState('');
  const [updateToGarnishee, setUpdateToGarnishee] = useState(false);

  if (!caseItem) return null;

  const resetForm = () => {
    setLogDate(new Date().toISOString().slice(0, 10));
    setLogCounsel('');
    setLogNote('');
    setLogAdjournedTo('');
    setUpdateToGarnishee(false);
  };

  const handleAddLog = () => {
    if (!logNote.trim() && !logAdjournedTo) return;
    onAddLog(caseItem.id, {
      date: logDate || today,
      type: 'note',
      counsel: logCounsel,
      note: logNote.trim(),
      adjournedTo: logAdjournedTo || undefined,
      updateToGarnishee,
    });
    resetForm();
  };

  const logs = caseItem.logs ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="log-date" className="text-xs">Date</Label>
                <Input id="log-date" type="date" value={logDate}
                  onChange={(e) => setLogDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="log-adj" className="text-xs">Adjourned Date (optional)</Label>
                <Input id="log-adj" type="date" value={logAdjournedTo}
                  onChange={(e) => setLogAdjournedTo(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Counsel</Label>
              <Select value={logCounsel} onValueChange={setLogCounsel}>
                <SelectTrigger><SelectValue placeholder="Select counsel" /></SelectTrigger>
                <SelectContent>
                  {counsels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="log-note" className="text-xs">Indorsement / Note</Label>
              <Textarea id="log-note" value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                placeholder="What happened on this date?" className="min-h-[80px]" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={updateToGarnishee}
                onCheckedChange={(v) => setUpdateToGarnishee(!!v)} />
              Update to be given to garnishee
            </label>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAddLog}
                disabled={!logNote.trim() && !logAdjournedTo}>
                <Plus className="h-4 w-4" /> Add to log
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No log entries yet.</p>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="rounded-lg border border-border p-3 bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">{formatDate(l.date)}</span>
                      {l.counsel && (
                        <span className="text-muted-foreground">· {l.counsel}</span>
                      )}
                      {l.adjournedTo && (
                        <Badge variant="outline">Adjourned to {formatDate(l.adjournedTo)}</Badge>
                      )}
                      {l.updateToGarnishee && (
                        <Badge className="bg-accent text-accent-foreground">Update to garnishee</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDateTime(l.createdAt)}</span>
                  </div>
                  {l.note && <p className="text-sm whitespace-pre-wrap">{l.note}</p>}
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