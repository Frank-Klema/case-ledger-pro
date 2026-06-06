/**
 * @fileoverview Settings dialog component for customizing app appearance and behavior.
 */

import { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Type, LayoutGrid, List, UserCheck, Plus, X, Waves, Trees, Sunset, Flower2, Sparkles, Gavel, Building, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings, Theme, FontSize, CasesPerPage } from '@/hooks/useSettings';
import { useCounsels } from '@/hooks/useCounsels';
import { useGarnishees, useCourts, useJudges } from '@/hooks/useLists';
import { cn } from '@/lib/utils';

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'ocean', label: 'Ocean', icon: Waves },
  { value: 'forest', label: 'Forest', icon: Trees },
  { value: 'midnight', label: 'Midnight', icon: Sparkles },
  { value: 'sunset', label: 'Sunset', icon: Sunset },
  { value: 'rose', label: 'Rose', icon: Flower2 },
];

const fontSizes: { value: FontSize; label: string; sample: string }[] = [
  { value: 'small', label: 'Small', sample: 'Aa' },
  { value: 'medium', label: 'Medium', sample: 'Aa' },
  { value: 'large', label: 'Large', sample: 'Aa' },
];

const casesPerPageOptions: { value: CasesPerPage; label: string }[] = [
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
];

export const SettingsDialog = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { counsels, addCounsel, removeCounsel } = useCounsels();
  const garnishees = useGarnishees();
  const courts = useCourts();
  const judges = useJudges();
  const [newCounsel, setNewCounsel] = useState('');
  const [newGarnishee, setNewGarnishee] = useState('');
  const [newCourt, setNewCourt] = useState('');
  const [newJudge, setNewJudge] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize the appearance and behavior of the application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Theme</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ theme: value })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all",
                    settings.theme === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    settings.theme === value ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-xs font-medium",
                    settings.theme === value ? "text-primary" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Font Size</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {fontSizes.map(({ value, label, sample }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ fontSize: value })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all",
                    settings.fontSize === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <span className={cn(
                    "font-heading",
                    value === 'small' && "text-sm",
                    value === 'medium' && "text-base",
                    value === 'large' && "text-lg",
                    settings.fontSize === value ? "text-primary" : "text-muted-foreground"
                  )}>
                    {sample}
                  </span>
                  <span className={cn(
                    "text-xs font-medium",
                    settings.fontSize === value ? "text-primary" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cases Per Page */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Cases Per Page</Label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {casesPerPageOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ casesPerPage: value })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all",
                    settings.casesPerPage === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    settings.casesPerPage === value ? "text-primary" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">Reduce spacing for denser layout</p>
              </div>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
            />
          </div>

          {/* Reset */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={resetSettings}
          >
            Reset to Defaults
          </Button>

          {/* Counsels manager */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Counsels</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage the list of counsels available in the Last Counsel selector.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="New counsel name"
                value={newCounsel}
                onChange={(e) => setNewCounsel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCounsel(newCounsel);
                    setNewCounsel('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => { addCounsel(newCounsel); setNewCounsel(''); }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {counsels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {counsels.map(c => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => removeCounsel(c)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${c}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};