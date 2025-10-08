"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Event } from "@/lib/types"

interface CalendarProps {
  events: Event[]
  onDateClick: (date: string) => void
  selectedDate?: string
}

export function Calendar({ events, onDateClick, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const formatDateString = (day: number) => {
    const date = new Date(year, month, day)
    return date.toISOString().split("T")[0]
  }

  const getEventsForDate = (day: number) => {
    const dateStr = formatDateString(day)
    return events.filter((e) => e.date === dateStr)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    const dateStr = formatDateString(day)
    return dateStr === selectedDate
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Generate calendar grid
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth} className="h-8 w-8 bg-transparent">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 bg-transparent">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const dayEvents = getEventsForDate(day)
          const hasEvents = dayEvents.length > 0
          const today = isToday(day)
          const selected = isSelected(day)

          return (
            <button
              key={day}
              onClick={() => onDateClick(formatDateString(day))}
              className={`
                min-h-[100px] p-2 rounded-lg border-2 transition-all
                hover:border-primary hover:shadow-md
                ${today ? "border-primary bg-primary/5" : "border-border"}
                ${selected ? "ring-2 ring-primary ring-offset-2" : ""}
                ${!today && !selected ? "hover:bg-secondary/50" : ""}
              `}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`text-sm font-semibold mb-1 ${today ? "text-primary" : "text-foreground"} ${selected ? "text-primary" : ""}`}
                >
                  {day}
                </span>
                {hasEvents && (
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-left text-xs px-1.5 py-0.5 rounded truncate"
                        style={{
                          backgroundColor: event.color || "#3b82f6",
                          color: "white",
                        }}
                        title={`${event.title}${event.note ? ` - ${event.note}` : ""}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1.5">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
