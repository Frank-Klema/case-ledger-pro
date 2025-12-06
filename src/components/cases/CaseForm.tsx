import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { CaseFormData, LegalCase } from '@/types/case';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const caseSchema = z.object({
  caseNumber: z.string().min(1, 'Case number is required'),
  title: z.string().min(1, 'Title is required'),
  client: z.string().min(1, 'Client name is required'),
  opposingParty: z.string(),
  type: z.enum(['civil', 'criminal', 'family', 'corporate', 'property', 'labor', 'garnishee', 'other']),
  status: z.enum(['open', 'pending', 'closed', 'archived']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  court: z.string(),
  judge: z.string(),
  filingDate: z.string(),
  nextHearing: z.string(),
  description: z.string(),
  notes: z.string(),
  garnisheeDetails: z.object({
    garnisheeCourt: z.string(),
    representedGarnishee: z.string(),
    garnisheeComment: z.string(),
    garnisheeDeadline: z.string(),
  }).optional(),
});

interface CaseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CaseFormData) => void;
  initialData?: LegalCase;
  mode: 'add' | 'edit';
}

export const CaseForm = ({ open, onClose, onSubmit, initialData, mode }: CaseFormProps) => {
  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: initialData || {
      caseNumber: '',
      title: '',
      client: '',
      opposingParty: '',
      type: 'civil',
      status: 'open',
      priority: 'medium',
      court: '',
      judge: '',
      filingDate: '',
      nextHearing: '',
      description: '',
      notes: '',
      garnisheeDetails: {
        garnisheeCourt: '',
        representedGarnishee: '',
        garnisheeComment: '',
        garnisheeDeadline: '',
      },
    },
  });

  const caseType = form.watch('type');
  const isGarnishee = caseType === 'garnishee';

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        garnisheeDetails: initialData.garnisheeDetails || {
          garnisheeCourt: '',
          representedGarnishee: '',
          garnisheeComment: '',
          garnisheeDeadline: '',
        },
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: CaseFormData) => {
    // Only include garnishee details if type is garnishee
    const submitData = {
      ...data,
      garnisheeDetails: data.type === 'garnishee' ? data.garnisheeDetails : undefined,
    };
    onSubmit(submitData);
    form.reset();
    onClose();
  };

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
              <FormField
                control={form.control}
                name="caseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Number</FormLabel>
                    <FormControl>
                      <Input placeholder="CASE-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Case title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input placeholder="Client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="opposingParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opposing Party</FormLabel>
                    <FormControl>
                      <Input placeholder="Opposing party name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="court"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Court</FormLabel>
                    <FormControl>
                      <Input placeholder="Court name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="judge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judge</FormLabel>
                    <FormControl>
                      <Input placeholder="Judge name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filing Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextHearing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Hearing</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isGarnishee && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-accent">Garnishee Details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="garnisheeDetails.garnisheeCourt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garnishee Court</FormLabel>
                          <FormControl>
                            <Input placeholder="Garnishee court name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="garnisheeDetails.representedGarnishee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Represented Garnishee</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of represented garnishee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="garnisheeDetails.garnisheeDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garnishee Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="garnisheeDetails.garnisheeComment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Garnishee Comment</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional comments about the garnishee proceeding..." 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the case..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="accent">
                {mode === 'add' ? 'Add Case' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
