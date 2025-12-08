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
import { LayoutDashboard, List, Calendar, Trash2 } from 'lucide-react';

const Index = () => {
  const { 
    cases, 
    deletedCases,
    addCase, 
    updateCase, 
    deleteCase, 
    restoreCase,
    permanentDeleteCase,
    emptyBin,
    restoreAllFromBin,
    importCases 
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
    setActiveTab('cases');
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
          <TabsList className="bg-muted/50">
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
            <Dashboard cases={cases} onFilterSelect={handleDashboardFilterSelect} />
          </TabsContent>

          <TabsContent value="cases" className="animate-fade-in">
            <CaseList
              cases={cases}
              onView={handleViewCase}
              onEdit={handleEditCase}
              onDelete={handleDeleteCase}
              onBatchDelete={handleBatchDelete}
              initialFilter={dashboardFilter}
            />
          </TabsContent>

          <TabsContent value="calendar" className="animate-fade-in">
            <CalendarView cases={cases} onViewCase={handleViewCase} />
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
