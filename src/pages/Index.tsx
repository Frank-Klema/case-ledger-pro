/**
 * @fileoverview Main index page component for the legal case management app.
 * Contains dashboard, case list, calendar, archived cases, and bin views.
 */

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Dashboard, DashboardFilter } from '@/components/dashboard/Dashboard';
import { CaseList } from '@/components/cases/CaseList';
import { BinList } from '@/components/cases/BinList';
import { CaseForm } from '@/components/cases/CaseForm';
import { CaseDetail } from '@/components/cases/CaseDetail';
import { ImportDialog } from '@/components/cases/ImportDialog';
import { CalendarView } from '@/components/calendar/CalendarView';
import { useCases } from '@/hooks/useCases';
import { exportToExcel } from '@/lib/excel';
import { LegalCase, CaseFormData } from '@/types/case';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, List, Calendar, Trash2, Archive, FileX } from 'lucide-react';

const Index = () => {
  const { 
    cases, 
    activeCases,
    archivedCases,
    pendingJudgmentCases,
    deletedCases,
    addCase, 
    updateCase, 
    deleteCase, 
    restoreCase,
    permanentDeleteCase,
    emptyBin,
    restoreAllFromBin,
    importCases,
    archiveCase,
    unarchiveCase,
  } = useCases();
  const { toast } = useToast();
  
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardFilter, setDashboardFilter] = useState<DashboardFilter>('all');

  const handleAddCase = () => {
    setSelectedCase(null);
    setFormMode('add');
    setFormOpen(true);
  };

  const handleEditCase = (caseItem: LegalCase) => {
    setSelectedCase(caseItem);
    setFormMode('edit');
    setFormOpen(true);
    setDetailOpen(false);
  };

  const handleViewCase = (caseItem: LegalCase) => {
    setSelectedCase(caseItem);
    setDetailOpen(true);
  };

  const handleDeleteCase = (id: string) => {
    deleteCase(id);
    toast({
      title: "Moved to Bin",
      description: "The case has been moved to the bin.",
    });
  };

  const handleBatchDelete = (ids: string[]) => {
    ids.forEach(id => deleteCase(id));
    toast({
      title: "Moved to Bin",
      description: `${ids.length} cases have been moved to the bin.`,
    });
  };

  const handleArchiveCase = (id: string) => {
    archiveCase(id);
    toast({
      title: "Case Archived",
      description: "The case has been archived.",
    });
  };

  const handleUnarchiveCase = (id: string) => {
    unarchiveCase(id);
    toast({
      title: "Case Unarchived",
      description: "The case has been restored from archive.",
    });
  };

  const handleRestoreCase = (id: string) => {
    restoreCase(id);
    toast({
      title: "Case Restored",
      description: "The case has been restored.",
    });
  };

  const handlePermanentDelete = (id: string) => {
    permanentDeleteCase(id);
    toast({
      title: "Permanently Deleted",
      description: "The case has been permanently deleted.",
    });
  };

  const handleEmptyBin = () => {
    emptyBin();
    toast({
      title: "Bin Emptied",
      description: "All cases in the bin have been permanently deleted.",
    });
  };

  const handleRestoreAll = () => {
    restoreAllFromBin();
    toast({
      title: "All Cases Restored",
      description: "All cases have been restored from the bin.",
    });
  };

  const handleFormSubmit = (data: CaseFormData) => {
    if (formMode === 'add') {
      addCase(data);
      toast({
        title: "Case Added",
        description: "New case has been successfully created.",
      });
    } else if (selectedCase) {
      updateCase(selectedCase.id, data);
      toast({
        title: "Case Updated",
        description: "The case has been successfully updated.",
      });
    }
  };

  const handleExport = () => {
    if (cases.length === 0) {
      toast({
        title: "No Cases",
        description: "There are no cases to export.",
        variant: "destructive",
      });
      return;
    }
    exportToExcel(cases);
    toast({
      title: "Export Complete",
      description: `${cases.length} cases exported to Excel.`,
    });
  };

  const handleImport = (importedCases: CaseFormData[]) => {
    const count = importCases(importedCases);
    toast({
      title: "Import Complete",
      description: `${count} cases imported successfully.`,
    });
  };

  const handleDashboardFilterSelect = (filter: DashboardFilter) => {
    setDashboardFilter(filter);
    if (filter === 'archived') {
      setActiveTab('archived');
    } else if (filter === 'pendingJudgment') {
      setActiveTab('pendingJudgment');
    } else {
      setActiveTab('cases');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAddCase={handleAddCase}
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
      />

      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 flex-wrap">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <List className="h-4 w-4" />
              All Cases
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="archived" className="gap-2">
              <Archive className="h-4 w-4" />
              Archived
              {archivedCases.length > 0 && (
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {archivedCases.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pendingJudgment" className="gap-2">
              <FileX className="h-4 w-4" />
              Judgments/Rulings to Collect
              {pendingJudgmentCases.length > 0 && (
                <span className="ml-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
                  {pendingJudgmentCases.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bin" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Bin
              {deletedCases.length > 0 && (
                <span className="ml-1 rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">
                  {deletedCases.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-fade-in">
            <Dashboard 
              cases={cases} 
              archivedCases={archivedCases}
              pendingJudgmentCases={pendingJudgmentCases}
              onFilterSelect={handleDashboardFilterSelect}
              onCaseClick={handleViewCase}
            />
          </TabsContent>

          <TabsContent value="cases" className="animate-fade-in">
            <CaseList
              cases={activeCases}
              onView={handleViewCase}
              onEdit={handleEditCase}
              onDelete={handleDeleteCase}
              onBatchDelete={handleBatchDelete}
              onArchive={handleArchiveCase}
              initialFilter={dashboardFilter}
            />
          </TabsContent>

          <TabsContent value="calendar" className="animate-fade-in">
            <CalendarView cases={activeCases} onViewCase={handleViewCase} />
          </TabsContent>

          <TabsContent value="archived" className="animate-fade-in">
            <CaseList
              cases={archivedCases}
              onView={handleViewCase}
              onEdit={handleEditCase}
              onDelete={handleDeleteCase}
              onBatchDelete={handleBatchDelete}
              showArchived={true}
            />
          </TabsContent>

          <TabsContent value="pendingJudgment" className="animate-fade-in">
            <CaseList
              cases={pendingJudgmentCases}
              onView={handleViewCase}
              onEdit={handleEditCase}
              onDelete={handleDeleteCase}
              onBatchDelete={handleBatchDelete}
            />
          </TabsContent>

          <TabsContent value="bin" className="animate-fade-in">
            <BinList
              deletedCases={deletedCases}
              onRestore={handleRestoreCase}
              onPermanentDelete={handlePermanentDelete}
              onEmptyBin={handleEmptyBin}
              onRestoreAll={handleRestoreAll}
            />
          </TabsContent>
        </Tabs>
      </main>

      <CaseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCase || undefined}
        mode={formMode}
      />

      <CaseDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        caseItem={selectedCase}
        onEdit={() => selectedCase && handleEditCase(selectedCase)}
      />

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default Index;