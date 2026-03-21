"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addDays, isToday } from "@/lib/date-utils"

interface DateNavigatorProps {
  currentDate: string
  onDateChange: (date: string) => void
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const isCurrentToday = isToday(currentDate)
  const display = new Date(currentDate + "T00:00:00")

  return (
    <div className="flex items-center gap-3 mb-6 px-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(addDays(currentDate, -1))}
        className="h-8 w-8 flex-shrink-0"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>

      <div className="flex-1 text-center">
        <p className="text-sm font-semibold text-foreground">
          {isCurrentToday
            ? "Today"
            : display.toLocaleDateString("en-US", { weekday: "long" })}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {display.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
        {!isCurrentToday && (
          <button
            onClick={() => onDateChange(new Date().toISOString().split("T")[0])}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-0.5 underline underline-offset-2"
          >
            Back to today
          </button>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(addDays(currentDate, 1))}
        className="h-8 w-8 flex-shrink-0"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
