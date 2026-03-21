"use client"

import { useState, useEffect, useCallback } from "react"
import { getChallengeLogsForChallenge, toggleChallengeLog } from "@/lib/data"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/date-utils"

interface ConsistencyGridProps {
  challengeId: string
  color: string
  onUpdate?: () => void
}

export function ConsistencyGrid({ challengeId, color, onUpdate }: ConsistencyGridProps) {
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const loadDays = useCallback(async () => {
    const dates = await getChallengeLogsForChallenge(challengeId)
    setCompletedDates(new Set(dates))
  }, [challengeId])

  useEffect(() => { loadDays() }, [loadDays])

  const handleDayClick = async (date: string) => {
    const user = await getCurrentUser()
    if (!user) return
    await toggleChallengeLog(challengeId, user.id, date)
    await loadDays()
    onUpdate?.()
  }

  // Generate last 12 weeks of dates (84 days)
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 83)

  const weeks: string[][] = []
  let currentWeek: string[] = []

  const startDay = startDate.getDay()
  for (let i = 0; i < startDay; i++) currentWeek.push("")

  for (let i = 0; i < 84; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    currentWeek.push(formatDate(date))
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = [] }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const monthLabels = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-1">
        <div className="flex flex-col gap-1 mr-1.5">
          <div className="h-3" />
          {monthLabels.map((label, i) => (
            <div key={i} className="h-3 text-[9px] text-muted-foreground flex items-center w-3 justify-center">
              {i % 2 === 1 ? label : ""}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            <div className="h-3 text-[9px] text-muted-foreground text-center min-w-3">
              {wi === 0 || wi % 4 === 0
                ? new Date(week.find((d) => d) || "").toLocaleDateString("en-US", { month: "short" })
                : ""}
            </div>
            {week.map((date, di) => (
              <button
                key={di}
                onClick={() => date && handleDayClick(date)}
                onMouseEnter={() => date && setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={!date}
                className="w-3 h-3 rounded-sm transition-all hover:ring-1 hover:ring-ring/50 disabled:cursor-default disabled:hover:ring-0"
                style={{
                  backgroundColor: date ? color : "transparent",
                  opacity: !date ? 0 : completedDates.has(date) ? 1 : 0.12,
                }}
                aria-label={date ? `Toggle ${date}` : undefined}
              />
            ))}
          </div>
        ))}
      </div>

      {hoveredDate && (
        <p className="text-xs text-muted-foreground">
          {new Date(hoveredDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric", year: "numeric",
          })}
          {" · "}
          {completedDates.has(hoveredDate) ? "Done" : "Not done"}
        </p>
      )}
    </div>
  )
}
