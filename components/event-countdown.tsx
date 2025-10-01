"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import type { Event } from "@/lib/types"

interface EventCountdownProps {
  events: Event[]
}

export function EventCountdown({ events }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ event: Event; days: number; hours: number } | null>(null)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const upcomingEvents = events
        .filter((event) => new Date(event.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (upcomingEvents.length > 0) {
        const nextEvent = upcomingEvents[0]
        const eventDate = new Date(nextEvent.date)
        const diff = eventDate.getTime() - now.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        setTimeLeft({ event: nextEvent, days, hours })
      } else {
        setTimeLeft(null)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [events])

  if (!timeLeft) {
    return null
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Upcoming Event</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{timeLeft.event.title}</p>
      <p className="text-lg font-semibold text-foreground">
        {timeLeft.days}d {timeLeft.hours}h
      </p>
    </div>
  )
}
