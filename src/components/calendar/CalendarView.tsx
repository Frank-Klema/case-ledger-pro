import { useState, useMemo } from 'react';
import { LegalCase, CalendarEvent } from '@/types/case';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
  parseISO,
} from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  cases: LegalCase[];
  onViewCase: (caseItem: LegalCase) => void;
}

export const CalendarView = ({ cases, onViewCase }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    cases.forEach((c) => {
      if (c.nextHearing) {
        allEvents.push({
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

      if (c.type === 'garnishee' && c.garnisheeDetails?.garnisheeDeadline) {
        allEvents.push({
          id: `garnishee-${c.id}`,
          caseId: c.id,
          caseNumber: c.caseNumber,
          title: `Garnishee: ${c.title}`,
          date: parseISO(c.garnisheeDetails.garnisheeDeadline),
          type: 'garnishee-deadline',
          priority: c.priority,
          court: c.garnisheeDetails.garnisheeCourt,
        });
      }
    });

    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [cases]);

  const days = useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const start = startOfWeek(monthStart, { weekStartsOn: 1 });
      const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, view]);

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    const caseItem = cases.find((c) => c.id === event.caseId);
    if (caseItem) {
      onViewCase(caseItem);
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const getEventBadgeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'hearing':
        return 'bg-primary text-primary-foreground';
      case 'garnishee-deadline':
        return 'bg-accent text-accent-foreground';
      case 'deadline':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-destructive';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-accent';
      default:
        return 'border-l-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-heading font-semibold ml-2">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
          </h2>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'week')}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
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
                      'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-accent',
                      !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                      isToday(day) && 'border-accent border-2',
                      isSelected && 'bg-accent/10 border-accent'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isToday(day) && 'text-accent font-bold'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            'text-xs p-1 rounded truncate cursor-pointer',
                            getEventBadgeColor(event.type)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          {event.caseNumber}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </div>
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
              {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
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
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {event.title}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs shrink-0', getEventBadgeColor(event.type))}
                        >
                          {event.type === 'hearing' ? 'Hearing' : 'Garnishee'}
                        </Badge>
                      </div>
                      {event.court && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.court}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(event.date, 'PPP')}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No events on this date</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Click on a date to view events
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.filter((e) => e.date >= new Date()).length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {events
                .filter((e) => e.date >= new Date())
                .slice(0, 6)
                .map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={cn(
                      'text-left p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors border-l-4',
                      getPriorityColor(event.priority)
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.caseNumber}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {event.title}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn('shrink-0', getEventBadgeColor(event.type))}
                      >
                        {event.type === 'hearing' ? 'Hearing' : 'Garnishee'}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {format(event.date, 'PPP')}
                      </div>
                      {event.court && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.court}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
