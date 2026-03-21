"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Event } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CalendarProps {
  events: Event[]
  onDateClick: (date: string) => void
  selectedDate?: string
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"]

export function Calendar({ events, onDateClick, selectedDate }: CalendarProps) {
  const [current, setCurrent] = useState(new Date())

  const year  = current.getFullYear()
  const month = current.getMonth()

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth    = new Date(year, month + 1, 0).getDate()

  const todayStr = new Date().toISOString().split("T")[0]

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const eventsOn = (day: number) => events.filter((e) => e.date === dateStr(day))

  // Build grid cells (null = empty padding)
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-border rounded overflow-hidden">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`e-${i}`} className="bg-card aspect-square" />
            }

            const ds       = dateStr(day)
            const isToday  = ds === todayStr
            const isSel    = ds === selectedDate
            const dayEvts  = eventsOn(day)

            return (
              <button
                key={day}
                onClick={() => onDateClick(ds)}
                className={cn(
                  "bg-card relative flex flex-col items-center pt-2 pb-1.5 min-h-[52px] transition-colors",
                  "hover:bg-secondary/60",
                  isSel && "bg-secondary",
                )}
              >
                {/* Day number */}
                <span
                  className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full leading-none",
                    isToday
                      ? "bg-foreground text-background"
                      : isSel
                        ? "text-foreground"
                        : "text-foreground",
                  )}
                >
                  {day}
                </span>

                {/* Event dots */}
                {dayEvts.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-[28px]">
                    {dayEvts.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ev.color || "#334155" }}
                        title={ev.title}
                      />
                    ))}
                    {dayEvts.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
