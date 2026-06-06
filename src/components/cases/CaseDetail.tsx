import { useState } from 'react';
import { LegalCase, CaseLog, CaseLogType } from '@/types/case';
import { CaseStatusBadge, CasePriorityBadge } from './CaseStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, User, Users, Building, Scale, UserCheck, Gavel, ClipboardList, Plus } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/date';
import { useCounsels } from '@/hooks/useCounsels';

interface CaseDetailProps {
  open: boolean;
  onClose: () => void;
  caseItem: LegalCase | null;
  onEdit: () => void;
  onAddLog?: (caseId: string, entry: Omit<CaseLog, 'id' | 'createdAt'>) => void;
}

const LOG_TYPE_LABELS: Record<CaseLogType, string> = {
  adjournment: 'Adjournment',
  indorsement: 'Indorsement',
  note: 'Note',
};

export const CaseDetail = ({ open, onClose, caseItem, onEdit, onAddLog }: CaseDetailProps) => {
  const { counsels, addCounsel } = useCounsels();
  const [showLogForm, setShowLogForm] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [logAdjournment, setLogAdjournment] = useState(false);
  const [logIndorsement, setLogIndorsement] = useState(false);
  const [logCounsel, setLogCounsel] = useState('');
  const [logAdjournedTo, setLogAdjournedTo] = useState('');
  const [logNote, setLogNote] = useState('');

  if (!caseItem) return null;

  const resetLogForm = () => {
    setShowLogForm(false);
    setLogDate(new Date().toISOString().slice(0, 10));
    setLogAdjournment(false);
    setLogIndorsement(false);
    setLogCounsel('');
    setLogAdjournedTo('');
    setLogNote('');
  };

  const submitLog = () => {
    if (!onAddLog) return;
    if (logCounsel) addCounsel(logCounsel);
    const types: CaseLogType[] = [];
    if (logAdjournment) types.push('adjournment');
    if (logIndorsement) types.push('indorsement');
    if (types.length === 0) types.push('note');
    onAddLog(caseItem.id, {
      date: logDate,
      type: types[0],
      types,
      counsel: logCounsel,
      note: logNote,
      adjournedTo: logAdjournment ? logAdjournedTo : undefined,
    });
    resetLogForm();
  };

  const logs = caseItem.logs ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{caseItem.caseNumber}</p>
              <DialogTitle className="font-heading text-xl mt-1">{caseItem.title}</DialogTitle>
            </div>
            <div className="flex gap-2">
              <CaseStatusBadge status={caseItem.status} />
              <CasePriorityBadge priority={caseItem.priority} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Judgment Creditor</p>
                <p className="font-medium">{caseItem.judgmentCreditor || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Judgment Debtor</p>
                <p className="font-medium">{caseItem.judgmentDebtor || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 sm:col-span-2">
              <Gavel className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Garnishee</p>
                <p className="font-medium">{caseItem.garnishee || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Court</p>
                <p className="font-medium">{caseItem.court || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Scale className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Judge</p>
                <p className="font-medium">{caseItem.judge || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Filing Date</p>
                <p className="font-medium">{formatDate(caseItem.filingDate)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Next Hearing</p>
                <p className="font-medium text-foreground">{formatDate(caseItem.nextHearing)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 sm:col-span-2">
              <UserCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Last Counsel (handled on last date)</p>
                <p className="font-medium">{caseItem.lastCounsel || '-'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <div className={`h-3 w-3 rounded-full ${caseItem.judgmentCollected ? 'bg-success' : 'bg-warning'}`} />
            <p className="font-medium">
              {caseItem.judgmentCollected ? 'Judgment/Order Collected' : 'Judgment/Order Not Yet Collected'}
            </p>
          </div>

          {caseItem.description && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm leading-relaxed">{caseItem.description}</p>
            </div>
          )}

          {caseItem.notes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">{caseItem.notes}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Case Log
              </h3>
              {onAddLog && !showLogForm && (
                <Button size="sm" variant="outline" onClick={() => setShowLogForm(true)}>
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              )}
            </div>

            {showLogForm && (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Date</label>
                    <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Counsel on this date</label>
                    <Select value={logCounsel || undefined} onValueChange={setLogCounsel}>
                      <SelectTrigger><SelectValue placeholder="Select counsel" /></SelectTrigger>
                      <SelectContent>
                        {counsels.length === 0 && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No counsels yet</div>
                        )}
                        {counsels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Entry covers (select any that apply)</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={logAdjournment} onCheckedChange={(c) => setLogAdjournment(!!c)} />
                      Adjournment
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={logIndorsement} onCheckedChange={(c) => setLogIndorsement(!!c)} />
                      Indorsement
                    </label>
                  </div>
                </div>
                {logAdjournment && (
                  <div>
                    <label className="text-xs text-muted-foreground">Adjourned to</label>
                    <Input type="date" value={logAdjournedTo} onChange={(e) => setLogAdjournedTo(e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground">
                    {logIndorsement ? 'Indorsement / Note' : 'Note'}
                  </label>
                  <Textarea
                    placeholder={logIndorsement ? "Court's indorsement on the case file..." : 'Notes...'}
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={resetLogForm}>Cancel</Button>
                  <Button size="sm" onClick={submitLog}>Save Entry</Button>
                </div>
              </div>
            )}

            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No log entries yet.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => {
                  const types = log.types && log.types.length > 0 ? log.types : [log.type];
                  const label = types.map(t => LOG_TYPE_LABELS[t]).join(' + ');
                  return (
                  <div key={log.id} className="rounded-lg border border-border p-3 bg-muted/30">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {label}
                        </span>
                        <span className="text-sm font-medium">{formatDate(log.date)}</span>
                      </div>
                      {log.counsel && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {log.counsel}
                        </span>
                      )}
                    </div>
                    {types.includes('adjournment') && log.adjournedTo && (
                      <p className="text-sm text-muted-foreground">
                        Adjourned to <span className="font-medium text-foreground">{formatDate(log.adjournedTo)}</span>
                      </p>
                    )}
                    {log.note && (
                      <p className="text-sm whitespace-pre-wrap mt-1">{log.note}</p>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
            <span>Created: {formatDateTime(caseItem.createdAt)}</span>
            <span>Updated: {formatDateTime(caseItem.updatedAt)}</span>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={onEdit}>Edit Case</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};