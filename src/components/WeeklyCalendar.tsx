
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface WeeklyCalendarProps {
  selectedWeek: { start: string; end: string };
  onWeekChange: (week: { start: string; end: string }) => void;
  className?: string;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedWeek,
  onWeekChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(selectedWeek.start));

  const getWeekFromDate = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    
    return {
      start: format(weekStart, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd')
    };
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const week = getWeekFromDate(date);
    setSelectedDate(date);
    onWeekChange(week);
    setIsOpen(false);
  };

  const formatWeekRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentStart = new Date(selectedWeek.start);
    const newDate = new Date(currentStart);
    newDate.setDate(currentStart.getDate() + (direction === 'next' ? 7 : -7));
    
    const week = getWeekFromDate(newDate);
    setSelectedDate(newDate);
    onWeekChange(week);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateWeek('prev')}
        className="h-12 px-3 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-200",
              className
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-700">Week Period</span>
              <span className="text-blue-600 font-medium">
                {formatWeekRange(selectedWeek.start, selectedWeek.end)}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white shadow-xl border-2 border-gray-200 rounded-lg" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="p-4 pointer-events-auto"
            disabled={false}
            fromYear={2020}
            toYear={2030}
          />
          <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-purple-50">
            <p className="text-sm text-gray-600 text-center font-medium">
              Select any date to choose that week
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateWeek('next')}
        className="h-12 px-3 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
