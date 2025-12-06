import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CaseList } from '@/components/cases/CaseList';
import { CaseForm } from '@/components/cases/CaseForm';
import { CaseDetail } from '@/components/cases/CaseDetail';
import { ImportDialog } from '@/components/cases/ImportDialog';
import { useCases } from '@/hooks/useCases';
import { exportToExcel } from '@/lib/excel';
import { LegalCase, CaseFormData } from '@/types/case';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, List } from 'lucide-react';

const Index = () => {
  const { cases, addCase, updateCase, deleteCase, importCases } = useCases();
  const { toast } = useToast();
  
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

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
      title: "Case Deleted",
      description: "The case has been successfully deleted.",
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

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAddCase={handleAddCase}
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
      />

      <main className="container py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <List className="h-4 w-4" />
              All Cases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-fade-in">
            <Dashboard cases={cases} />
          </TabsContent>

          <TabsContent value="cases" className="animate-fade-in">
            <CaseList
              cases={cases}
              onView={handleViewCase}
              onEdit={handleEditCase}
              onDelete={handleDeleteCase}
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
