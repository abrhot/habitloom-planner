"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getEvents, addEvent, deleteEvent } from "@/lib/data"
import type { User, Event } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Calendar } from "@/components/calendar"
import { Plus, Trash2, Clock, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export default function EventsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDate, setNewEventDate] = useState("")
  const [newEventNote, setNewEventNote] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>("")

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    loadEvents(currentUser.id)
  }, [router])

  const loadEvents = (userId: string) => {
    setEvents(getEvents(userId))
  }

  const handleAddEvent = () => {
    if (!user || !newEventTitle.trim() || !newEventDate) return

    addEvent(user.id, {
      title: newEventTitle.trim(),
      date: newEventDate,
      note: newEventNote.trim() || undefined,
    })

    setNewEventTitle("")
    setNewEventDate("")
    setNewEventNote("")
    loadEvents(user.id)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (!user) return
    deleteEvent(eventId)
    loadEvents(user.id)
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setNewEventDate(date)
  }

  const getTimeUntilEvent = (eventDate: string) => {
    const now = new Date()
    const event = new Date(eventDate)
    const diff = event.getTime() - now.getTime()

    if (diff < 0) return "Past event"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const selectedDateEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : []

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Events & Calendar</h1>
            <p className="text-muted-foreground">Schedule and track your important events</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Calendar events={events} onDateClick={handleDateClick} selectedDate={selectedDate} />

              {selectedDate && (
                <Card className="mt-6 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Events on{" "}
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-secondary/50 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground">{event.title}</h4>
                              {event.note && <p className="text-sm text-muted-foreground mt-1">{event.note}</p>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No events scheduled for this date</p>
                  )}
                </Card>
              )}
            </div>

            {/* Add Event Form and Upcoming Events */}
            <div className="space-y-6">
              {/* Add Event Form */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Event
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Event Title</label>
                    <Input
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="Enter event title"
                      className="hover:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
                    <Input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="hover:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Note (Optional)</label>
                    <Textarea
                      value={newEventNote}
                      onChange={(e) => setNewEventNote(e.target.value)}
                      placeholder="Add a note or reminder"
                      rows={3}
                      className="hover:border-primary/50 transition-colors resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleAddEvent}
                    disabled={!newEventTitle.trim() || !newEventDate}
                    className="w-full hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </Card>

              {/* Upcoming Events List */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Upcoming Events
                </h2>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {sortedEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 text-sm">No events scheduled</p>
                  ) : (
                    sortedEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="bg-secondary/50 rounded-lg p-3 border border-border hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedDate(event.date)}
                      >
                        <h3 className="font-medium text-sm">{event.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                          <Clock className="w-3 h-3" />
                          {getTimeUntilEvent(event.date)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
