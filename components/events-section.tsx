"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { EventItem } from "./event-item"
import type { Event } from "@/lib/types"
import { getEvents, createEvent, deleteEvent } from "@/lib/data"

interface EventsSectionProps {
  userId: string
  currentDate: string
}

export function EventsSection({ userId, currentDate }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [newEventTitle, setNewEventTitle] = useState("")
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [userId, currentDate])

  const loadEvents = () => {
    const data = getEvents(userId, currentDate)
    setEvents(data)
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (newEventTitle.trim()) {
      createEvent(userId, currentDate, newEventTitle.trim())
      setNewEventTitle("")
      setShowInput(false)
      loadEvents()
    }
  }

  const handleDelete = (id: string) => {
    deleteEvent(id)
    loadEvents()
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Events</h2>
        <Button variant="ghost" size="icon" onClick={() => setShowInput(true)} className="h-8 w-8" disabled={showInput}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add event</span>
        </Button>
      </div>

      <div className="space-y-2">
        {events.map((event) => (
          <EventItem key={event.id} event={event} onDelete={handleDelete} />
        ))}

        {showInput && (
          <form onSubmit={handleAddEvent} className="flex gap-2 mt-3">
            <Input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Add an event..."
              autoFocus
              onBlur={() => {
                if (!newEventTitle.trim()) {
                  setShowInput(false)
                }
              }}
            />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
        )}

        {events.length === 0 && !showInput && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4 text-pretty">
              No events scheduled. Add an event to your calendar.
            </p>
            <Button onClick={() => setShowInput(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add event
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
