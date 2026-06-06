import { useState, useMemo } from 'react';
import { LegalCase, CalendarEvent } from '@/types/case';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, isToday, parseISO,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date';

interface CalendarViewProps {
  cases: LegalCase[];
  onViewCase: (caseItem: LegalCase) => void;
  onAddCase?: (defaultDate?: string) => void;
}

export const CalendarView = ({ cases, onViewCase, onAddCase }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events = useMemo(() => {
    const all: CalendarEvent[] = [];
    cases.forEach((c) => {
      if (c.nextHearing) {
        all.push({
          id: `hearing-${c.id}`,
          caseId: c.id,
          caseNumber: c.caseNumber,
          title: c.title,
          date: parseISO(c.nextHearing),
          type: 'hearing',
          priority: c.priority,
          court: c.court,
        });
      }
    });
    return all.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [cases]);

  const days = useMemo(() => {
    if (view === 'month') {
      const ms = startOfMonth(currentDate);
      const me = endOfMonth(currentDate);
      return eachDayOfInterval({
        start: startOfWeek(ms, { weekStartsOn: 1 }),
        end: endOfWeek(me, { weekStartsOn: 1 }),
      });
    }
    return eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    });
  }, [currentDate, view]);

  const getEventsForDate = (date: Date) => events.filter((e) => isSameDay(e.date, date));

  const handlePrev = () => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  const handleNext = () => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleEventClick = (event: CalendarEvent) => {
    const c = cases.find(x => x.id === event.caseId);
    if (c) onViewCase(c);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const getEventBadgeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'hearing': return 'bg-primary text-primary-foreground';
      case 'garnishee-deadline': return 'bg-accent text-accent-foreground';
      case 'deadline': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-destructive';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-accent';
      default: return 'border-l-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={handleToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
          <h2 className="text-lg font-heading font-semibold ml-2">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Week of' dd/MM/yyyy")}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'week')}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="p-2 text-center text-sm font-medium text-muted-foreground">{d}</div>
              ))}

              {days.map((day, idx) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border rounded-md transition-colors text-left',
                      'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary',
                      !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                      isToday(day) && 'border-primary border-2 bg-primary/10',
                      isSelected && 'bg-primary/15 border-primary'
                    )}
                  >
                    <span className={cn('text-sm font-medium', isToday(day) && 'text-primary font-bold')}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn('text-xs p-1 rounded truncate cursor-pointer', getEventBadgeColor(event.type))}
                          onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                        >
                          {event.caseNumber}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate ? format(selectedDate, 'EEEE, dd/MM/yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border-l-4 bg-muted/50 hover:bg-muted transition-colors',
                        getPriorityColor(event.priority)
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.caseNumber}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{event.title}</p>
                        </div>
                        <Badge variant="secondary" className={cn('text-xs shrink-0', getEventBadgeColor(event.type))}>
                          {event.type === 'hearing' ? 'Hearing' : 'Garnishee'}
                        </Badge>
                      </div>
                      {event.court && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {event.court}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatDate(event.date)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No events on this date</p>
                  {onAddCase && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onAddCase(format(selectedDate, 'yyyy-MM-dd'))}
                    >
                      <Plus className="h-4 w-4" /> Add Case on this date
                    </Button>
                  )}
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">Click on a date to view events</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};