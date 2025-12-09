/**
 * @fileoverview Case detail dialog component showing all case information.
 * Displays comprehensive case details including garnishee fields if applicable.
 */

import { LegalCase } from '@/types/case';
import { CaseStatusBadge, CasePriorityBadge } from './CaseStatusBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, User, Users, Building, Scale, FileText, Gavel, Clock, MessageSquare, UserCheck } from 'lucide-react';

interface CaseDetailProps {
  open: boolean;
  onClose: () => void;
  caseItem: LegalCase | null;
  onEdit: () => void;
}

export const CaseDetail = ({ open, onClose, caseItem, onEdit }: CaseDetailProps) => {
  if (!caseItem) return null;

  const isGarnishee = caseItem.type === 'garnishee';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
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
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{caseItem.client || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Opposing Party</p>
                <p className="font-medium">{caseItem.opposingParty || '-'}</p>
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
                <p className="font-medium">
                  {caseItem.filingDate ? new Date(caseItem.filingDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Next Hearing</p>
                <p className="font-medium text-foreground">
                  {caseItem.nextHearing ? new Date(caseItem.nextHearing).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            {/* Last Counsel Field */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 sm:col-span-2">
              <UserCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Last Counsel (Handled on Last Date)</p>
                <p className="font-medium">{caseItem.lastCounsel || '-'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Case Type</p>
            </div>
            <p className="capitalize">{caseItem.type}</p>
          </div>

          {/* Judgment Collection Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <div className={`h-3 w-3 rounded-full ${caseItem.judgmentCollected ? 'bg-success' : 'bg-warning'}`} />
            <div>
              <p className="font-medium">
                {caseItem.judgmentCollected ? 'Judgment/Order Collected' : 'Judgment/Order Not Yet Collected'}
              </p>
            </div>
          </div>

          {isGarnishee && caseItem.garnisheeDetails && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-heading font-semibold text-primary flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  Garnishee Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                    <Building className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Garnishee Court</p>
                      <p className="font-medium">{caseItem.garnisheeDetails.garnisheeCourt || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Represented Garnishee</p>
                      <p className="font-medium">{caseItem.garnisheeDetails.representedGarnishee || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Garnishee Deadline</p>
                      <p className="font-medium text-foreground">
                        {caseItem.garnisheeDetails.garnisheeDeadline 
                          ? new Date(caseItem.garnisheeDetails.garnisheeDeadline).toLocaleDateString() 
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {caseItem.garnisheeDetails.garnisheeComment && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">Garnishee Comment</p>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap bg-primary/10 p-3 rounded-lg">
                      {caseItem.garnisheeDetails.garnisheeComment}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {caseItem.description && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm leading-relaxed">{caseItem.description}</p>
            </div>
          )}

          {caseItem.notes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                {caseItem.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
            <span>Created: {new Date(caseItem.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(caseItem.updatedAt).toLocaleString()}</span>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onEdit}>
              Edit Case
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};