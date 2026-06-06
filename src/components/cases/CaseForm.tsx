import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { CaseFormData, LegalCase } from '@/types/case';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useCounsels } from '@/hooks/useCounsels';
import { useGarnishees, useCourts, useJudges } from '@/hooks/useLists';

const caseSchema = z.object({
  caseNumber: z.string().min(1, 'Case number is required'),
  title: z.string().min(1, 'Title is required'),
  judgmentCreditor: z.string().min(1, 'Judgment creditor is required'),
  judgmentDebtor: z.string(),
  garnishee: z.string(),
  status: z.enum(['open', 'pending', 'closed', 'archived']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  court: z.string(),
  judge: z.string(),
  filingDate: z.string(),
  nextHearing: z.string(),
  garnisheeDeadline: z.string(),
  description: z.string(),
  notes: z.string(),
  judgmentCollected: z.boolean(),
  lastCounsel: z.string(),
  isArchived: z.boolean(),
});

const EMPTY: CaseFormData = {
  caseNumber: '',
  title: '',
  judgmentCreditor: '',
  judgmentDebtor: '',
  garnishee: '',
  status: 'open',
  priority: 'medium',
  court: '',
  judge: '',
  filingDate: '',
  nextHearing: '',
  garnisheeDeadline: '',
  description: '',
  notes: '',
  judgmentCollected: false,
  lastCounsel: '',
  isArchived: false,
};

interface CaseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CaseFormData) => void;
  initialData?: LegalCase;
  mode: 'add' | 'edit';
  defaultNextHearing?: string;
}

export const CaseForm = ({ open, onClose, onSubmit, initialData, mode, defaultNextHearing }: CaseFormProps) => {
  const { counsels, addCounsel } = useCounsels();
  const garnisheesList = useGarnishees();
  const courtsList = useCourts();
  const judgesList = useJudges();
  const [newCounsel, setNewCounsel] = useState('');
  const [newGarnishee, setNewGarnishee] = useState('');
  const [newCourt, setNewCourt] = useState('');
  const [newJudge, setNewJudge] = useState('');

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: EMPTY,
  });

  // Reset whenever the dialog opens — no residue from a previous case.
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      form.reset({
        caseNumber: initialData.caseNumber,
        title: initialData.title,
        judgmentCreditor: initialData.judgmentCreditor ?? '',
        judgmentDebtor: initialData.judgmentDebtor ?? '',
        garnishee: initialData.garnishee ?? '',
        status: initialData.status,
        priority: initialData.priority,
        court: initialData.court ?? '',
        judge: initialData.judge ?? '',
        filingDate: initialData.filingDate ?? '',
        nextHearing: initialData.nextHearing ?? '',
        garnisheeDeadline: initialData.garnisheeDeadline ?? '',
        description: initialData.description ?? '',
        notes: initialData.notes ?? '',
        judgmentCollected: initialData.judgmentCollected ?? false,
        lastCounsel: initialData.lastCounsel ?? '',
        isArchived: initialData.isArchived ?? false,
      });
    } else {
      form.reset({ ...EMPTY, nextHearing: defaultNextHearing || '' });
    }
    setNewCounsel('');
    setNewGarnishee('');
    setNewCourt('');
    setNewJudge('');
  }, [open, mode, initialData, defaultNextHearing, form]);

  const handleSubmit = (data: CaseFormData) => {
    if (data.lastCounsel) addCounsel(data.lastCounsel);
    if (data.garnishee) garnisheesList.add(data.garnishee);
    if (data.court) courtsList.add(data.court);
    if (data.judge) judgesList.add(data.judge);
    onSubmit(data);
    form.reset(EMPTY);
    onClose();
  };

  const handleAddCounsel = () => {
    const name = newCounsel.trim();
    if (!name) return;
    addCounsel(name);
    form.setValue('lastCounsel', name);
    setNewCounsel('');
  };

  const renderManagedSelect = (
    fieldName: 'garnishee' | 'court' | 'judge',
    label: string,
    placeholder: string,
    list: { items: string[]; add: (n: string) => void },
    newVal: string,
    setNewVal: (v: string) => void,
    colSpan = false,
  ) => (
    <FormField control={form.control} name={fieldName} render={({ field }) => (
      <FormItem className={colSpan ? 'sm:col-span-2' : ''}>
        <FormLabel>{label}</FormLabel>
        <Select onValueChange={field.onChange} value={field.value || undefined}>
          <FormControl><SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger></FormControl>
          <SelectContent>
            {list.items.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No entries yet — add one below
              </div>
            )}
            {list.items.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder={`Add new ${label.toLowerCase()}`}
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const name = newVal.trim();
                if (!name) return;
                list.add(name);
                form.setValue(fieldName, name);
                setNewVal('');
              }
            }}
          />
          <Button type="button" variant="outline" onClick={() => {
            const name = newVal.trim();
            if (!name) return;
            list.add(name);
            form.setValue(fieldName, name);
            setNewVal('');
          }}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <FormMessage />
      </FormItem>
    )} />
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {mode === 'add' ? 'Add New Case' : 'Edit Case'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="caseNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Number</FormLabel>
                  <FormControl><Input placeholder="GARN-2026-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Case title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="judgmentCreditor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Judgment Creditor</FormLabel>
                  <FormControl><Input placeholder="Judgment creditor" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="judgmentDebtor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Judgment Debtor</FormLabel>
                  <FormControl><Input placeholder="Judgment debtor" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {renderManagedSelect('garnishee', 'Garnishee', 'Select garnishee', garnisheesList, newGarnishee, setNewGarnishee, true)}

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {renderManagedSelect('court', 'Court', 'Select court', courtsList, newCourt, setNewCourt)}
              {renderManagedSelect('judge', 'Judge', 'Select judge', judgesList, newJudge, setNewJudge)}

              <FormField control={form.control} name="filingDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Filing Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="nextHearing" render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Hearing</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="lastCounsel" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Last Counsel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select counsel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {counsels.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No counsels yet — add one below
                        </div>
                      )}
                      {counsels.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add new counsel"
                      value={newCounsel}
                      onChange={(e) => setNewCounsel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCounsel();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddCounsel}>
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="judgmentCollected" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Judgment/Order Collected</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Mark if copy of judgment or court order has been collected
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="isArchived" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Archive Case</FormLabel>
                  <p className="text-sm text-muted-foreground">Move this case to the archive</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brief description of the case..." className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes..." className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{mode === 'add' ? 'Add Case' : 'Save Changes'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};