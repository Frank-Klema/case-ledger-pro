import { Settings, Moon, Sun, Monitor, Type, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useSettings, Theme, FontSize } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const fontSizes: { value: FontSize; label: string; sample: string }[] = [
  { value: 'small', label: 'Small', sample: 'Aa' },
  { value: 'medium', label: 'Medium', sample: 'Aa' },
  { value: 'large', label: 'Large', sample: 'Aa' },
];

export const SettingsDialog = () => {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};