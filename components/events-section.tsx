"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import type { Event } from "@/lib/types"
import { getEvents, addEvent, deleteEvent } from "@/lib/data"

interface EventsSectionProps {
  userId: string
  currentDate: string
}

export function EventsSection({ userId, currentDate }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [newEventTitle, setNewEventTitle] = useState("")
  const [showInput, setShowInput] = useState(false)

  const loadEvents = useCallback(async () => {
    const data = await getEvents(userId)
    setEvents(data.filter((e) => e.date === currentDate))
  }, [userId, currentDate])

  useEffect(() => { loadEvents() }, [loadEvents])

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newEventTitle.trim()) {
      await addEvent(userId, { title: newEventTitle.trim(), date: currentDate })
      setNewEventTitle("")
      setShowInput(false)
      loadEvents()
    }
  }

  const handleDelete = async (id: string) => {
    await deleteEvent(id)
    loadEvents()
  }

  return (
    <div className="section-box p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Events</h2>
        <Button variant="ghost" size="icon" onClick={() => setShowInput(true)} className="h-8 w-8 btn-press" disabled={showInput}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {events.map((event) => (
          <div key={event.id} className="row-hover flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color || "#334155" }} />
              <span className="text-sm text-foreground">{event.title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(event.id)}
              className="h-6 w-6 text-muted-foreground hover:text-destructive btn-press"
            />
          </div>
        ))}

        {showInput && (
          <form onSubmit={handleAddEvent} className="flex gap-2 mt-3">
            <Input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Add an event..."
              autoFocus
              onBlur={() => { if (!newEventTitle.trim()) setShowInput(false) }}
            />
            <Button type="submit" size="sm" className="btn-press">Add</Button>
          </form>
        )}

        {events.length === 0 && !showInput && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">No events for this day.</p>
            <Button onClick={() => setShowInput(true)} variant="outline" size="sm" className="btn-press">
              <Plus className="h-3.5 w-3.5 mr-1.5" />Add event
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
