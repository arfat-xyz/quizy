"use client";

import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  startOfWeek,
  endOfWeek,
  subDays,
} from "date-fns";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
  buttonClassName?: string;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  buttonClassName,
}: DatePickerWithRangeProps) {
  const today = new Date();

  const presets = [
    {
      label: "Today",
      value: {
        from: today,
        to: today,
      },
    },
    {
      label: "Yesterday",
      value: {
        from: subDays(today, 1),
        to: subDays(today, 1),
      },
    },
    {
      label: "This Week",
      value: {
        from: startOfWeek(today, { weekStartsOn: 1 }), // Monday as start of week
        to: endOfWeek(today, { weekStartsOn: 1 }),
      },
    },
    {
      label: "This Month",
      value: {
        from: startOfMonth(today),
        to: endOfMonth(today),
      },
    },
    {
      label: "Last Month",
      value: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      },
    },
    {
      label: "This Year",
      value: {
        from: startOfYear(today),
        to: endOfYear(today),
      },
    },
    {
      label: "Last Year",
      value: {
        from: startOfYear(subDays(startOfYear(today), 1)),
        to: endOfYear(subDays(endOfYear(today), 1)),
      },
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full cursor-pointer justify-start text-left font-normal",
              !date && "text-muted-foreground",
              buttonClassName,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {date.from.toLocaleDateString()} -{" "}
                  {date.to.toLocaleDateString()}
                </>
              ) : (
                date.from.toLocaleDateString()
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mr-10 w-auto p-0" align="start">
          <div className="flex w-2xl">
            <div className="space-y-2 border-r p-3">
              <div className="mb-2 text-sm font-medium">Quick Select</div>
              {presets.map(preset => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full cursor-pointer justify-start text-left"
                  onClick={() => setDate(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </div>
          </div>
          {date && (
            <div className="border-t p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDate(undefined)}
                className="mx-auto w-1/6 cursor-pointer bg-red-500 px-4 text-white"
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
