/**
 * @fileoverview Settings dialog component for customizing app appearance and behavior.
 */

import { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Type, LayoutGrid, List, UserCheck, Plus, X, Waves, Trees, Sunset, Flower2, Sparkles, Gavel, Building, Scale, BookOpen, ChevronDown } from 'lucide-react';
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
  const [showTutorial, setShowTutorial] = useState(false);

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

          {/* Quick Tutorial — collapsible, written for first-time users */}
          <div className="space-y-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setShowTutorial(v => !v)}
              className="w-full flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Quick Tutorial
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', showTutorial && 'rotate-180')} />
            </button>
            {showTutorial && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-3 leading-relaxed">
                <p className="font-medium text-foreground">Welcome! Here's the 60-second tour:</p>
                <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                  <li>
                    <span className="text-foreground font-medium">Add a case</span> — click
                    <em> New Case</em> in the top-right. Fill in the case number, parties
                    (Order Creditor, Order Debtor, Garnishee), court, judge and the next
                    hearing date. Garnishee, Court, Judge and Counsel all remember past
                    entries so you can pick them next time.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">Dashboard</span> shows
                    totals, urgent cases and a status bar chart. Click any stat card to
                    jump into the matching list.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">Calendar</span> shows
                    every next hearing. Click a date to see what's on; click an empty
                    date to add a case scheduled for it.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">Case Log</span> — open
                    a case and click <em>Add Entry</em> to record an adjournment or
                    indorsement. Setting an <em>Adjourned Date</em> instantly becomes the
                    case's new Next Hearing everywhere.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">Import / Export</span>
                    — use the buttons in the header to move cases to and from Excel
                    (.xlsx). Download the template from the import dialog for the right
                    column layout.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">Archive vs Bin</span>
                    — Archive keeps a finished case out of the way but searchable. Bin
                    is a soft-delete; restore or empty it any time.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">Themes & sizing</span>
                    — pick a theme above, set text size and toggle Compact Mode for a
                    denser layout.
                  </li>
                </ol>
              </div>
            )}
          </div>

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

          {/* Garnishees / Courts / Judges managers */}
          {([
            { label: 'Garnishees', icon: Gavel, list: garnishees, value: newGarnishee, set: setNewGarnishee },
            { label: 'Courts', icon: Building, list: courts, value: newCourt, set: setNewCourt },
            { label: 'Judges', icon: Scale, list: judges, value: newJudge, set: setNewJudge },
          ] as const).map(({ label, icon: Icon, list, value, set }) => (
            <div key={label} className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">{label}</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={`New ${label.toLowerCase().slice(0, -1)} name`}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      list.add(value);
                      set('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { list.add(value); set(''); }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {list.items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {list.items.map(c => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => list.remove(c)}
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
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};