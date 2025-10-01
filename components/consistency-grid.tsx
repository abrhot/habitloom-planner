"use client"

import { useState, useEffect } from "react"
import type { ChallengeDay } from "@/lib/types"
import { getChallengeDays, toggleChallengeDay } from "@/lib/data"
import { formatDate } from "@/lib/date-utils"

interface ConsistencyGridProps {
  challengeId: string
  color: string
  onUpdate?: () => void
}

export function ConsistencyGrid({ challengeId, color, onUpdate }: ConsistencyGridProps) {
  const [days, setDays] = useState<ChallengeDay[]>([])
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  useEffect(() => {
    loadDays()
  }, [challengeId])

  const loadDays = () => {
    const data = getChallengeDays(challengeId)
    setDays(data)
  }

  const handleDayClick = (date: string) => {
    toggleChallengeDay(challengeId, date)
    loadDays()
    onUpdate?.()
  }

  // Generate last 12 weeks of dates (84 days)
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 83) // 84 days total including today

  const weeks: string[][] = []
  let currentWeek: string[] = []

  // Fill in empty days at the start to align with Sunday
  const startDay = startDate.getDay()
  for (let i = 0; i < startDay; i++) {
    currentWeek.push("")
  }

  // Generate all dates
  for (let i = 0; i < 84; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = formatDate(date)

    currentWeek.push(dateStr)

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const isCompleted = (date: string) => {
    return days.some((d) => d.date === date && d.completed)
  }

  const getOpacity = (date: string) => {
    if (!date) return 0
    return isCompleted(date) ? 1 : 0.15
  }

  const monthLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 mr-2">
          <div className="h-3" />
          {monthLabels.map((label, i) => (
            <div key={i} className="h-3 text-[10px] text-muted-foreground flex items-center">
              {i % 2 === 1 ? label.slice(0, 1) : ""}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            <div className="h-3 text-[10px] text-muted-foreground text-center">
              {weekIndex === 0 || weekIndex % 4 === 0
                ? new Date(week.find((d) => d) || "").toLocaleDateString("en-US", { month: "short" })
                : ""}
            </div>
            {week.map((date, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => date && handleDayClick(date)}
                onMouseEnter={() => date && setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={!date}
                className="w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-ring disabled:cursor-default disabled:hover:ring-0"
                style={{
                  backgroundColor: date ? color : "transparent",
                  opacity: getOpacity(date),
                }}
                aria-label={date ? `Toggle ${date}` : undefined}
              />
            ))}
          </div>
        ))}
      </div>

      {hoveredDate && (
        <div className="text-xs text-muted-foreground">
          {new Date(hoveredDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {isCompleted(hoveredDate) ? " - Completed" : " - Not completed"}
        </div>
      )}
    </div>
  )
}
