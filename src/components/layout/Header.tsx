import { Scale, FileSpreadsheet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
interface HeaderProps {
  onAddCase: () => void;
  onExport: () => void;
  onImport: () => void;
}
export const Header = ({
  onAddCase,
  onExport,
  onImport
}: HeaderProps) => {
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">Ugo Udoji & Co</h1>
            <p className="text-xs text-muted-foreground">Case Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SettingsDialog />
          <Button variant="outline" size="sm" onClick={onImport}>
            <FileSpreadsheet className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <FileSpreadsheet className="h-4 w-4" />
            Export
          </Button>
          <Button variant="accent" size="sm" onClick={onAddCase}>
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>
    </header>;
};