"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getEvents, addEvent, deleteEvent } from "@/lib/data"
import type { User, Event } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Calendar } from "@/components/calendar"
import { Plus, Trash2, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const EVENT_COLORS = [
  { name: "Slate",   value: "#334155" },
  { name: "Indigo",  value: "#4f46e5" },
  { name: "Violet",  value: "#7c3aed" },
  { name: "Rose",    value: "#e11d48" },
  { name: "Amber",   value: "#d97706" },
  { name: "Emerald", value: "#059669" },
  { name: "Sky",     value: "#0284c7" },
  { name: "Pink",    value: "#db2777" },
]

export default function EventsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newNote, setNewNote] = useState("")
  const [newColor, setNewColor] = useState(EVENT_COLORS[0].value)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      if (!currentUser) { router.push("/"); return }
      setUser(currentUser)
      getEvents(currentUser.id).then(setEvents)
    })
  }, [router])

  const reload = (userId: string) => getEvents(userId).then(setEvents)

  const handleAdd = async () => {
    if (!user || !newTitle.trim() || !newDate) return
    await addEvent(user.id, {
      title: newTitle.trim(),
      date: newDate,
      time: newTime || undefined,
      note: newNote.trim() || undefined,
      color: newColor,
    })
    setNewTitle(""); setNewDate(""); setNewTime(""); setNewNote("")
    setNewColor(EVENT_COLORS[0].value)
    setShowForm(false)
    reload(user.id)
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    if (deleteConfirm === id) {
      await deleteEvent(id); setDeleteConfirm(null); reload(user.id)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 2500)
    }
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setNewDate(date)
  }

  const timeUntil = (date: string, time?: string) => {
    const diff = new Date(time ? `${date}T${time}` : `${date}T00:00:00`).getTime() - Date.now()
    if (diff < 0) return null
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  const today = new Date().toISOString().split("T")[0]
  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : []
  const upcoming = [...events]
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""))
  const past = [...events]
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-label mb-1">Schedule</p>
              <h1 className="text-2xl font-semibold text-foreground">Events & Calendar</h1>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="gradient-primary text-primary-foreground h-9 px-4 text-sm rounded shadow-card hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Event
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

            {/* Left — Calendar + selected day */}
            <div className="space-y-5">
              <Calendar events={events} onDateClick={handleDateClick} selectedDate={selectedDate} />

              {selectedDate && (
                <div className="section-box overflow-hidden animate-in-up">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "long", month: "long", day: "numeric", year: "numeric",
                        })}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowForm(true); setNewDate(selectedDate) }}
                      className="h-7 px-2.5 text-xs gap-1 btn-press"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>

                  <div className="px-5 py-4">
                    {selectedEvents.length > 0 ? (
                      <div className="divide-y divide-border">
                        {selectedEvents.map((ev) => (
                          <EventRow
                            key={ev.id}
                            event={ev}
                            onDelete={handleDelete}
                            deleteConfirm={deleteConfirm}
                            until={timeUntil(ev.date, ev.time)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-5 text-center">
                        <p className="text-sm text-muted-foreground mb-3">No events on this day</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setShowForm(true); setNewDate(selectedDate) }}
                          className="h-8 text-xs btn-press"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Add event
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">

              {/* Upcoming */}
              <div className="section-box overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Upcoming</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{upcoming.length} event{upcoming.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {upcoming.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No upcoming events</p>
                  ) : (
                    upcoming.map((ev) => {
                      const until = timeUntil(ev.date, ev.time)
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedDate(ev.date)}
                          className="w-full text-left px-4 py-3 hover:bg-secondary/60 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                              style={{ backgroundColor: ev.color || "#334155" }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 stat-number">
                                {new Date(ev.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                {ev.time && ` · ${ev.time}`}
                              </p>
                              {until && (
                                <p className="text-xs font-semibold mt-0.5 stat-number" style={{ color: ev.color || "#334155" }}>
                                  in {until}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Past */}
              {past.length > 0 && (
                <div className="section-box overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-muted-foreground">Past Events</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {past.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedDate(ev.date)}
                        className="w-full text-left px-4 py-2.5 hover:bg-secondary/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-40"
                            style={{ backgroundColor: ev.color || "#334155" }}
                          />
                          <p className="text-xs text-muted-foreground truncate flex-1">{ev.title}</p>
                          <p className="text-xs text-muted-foreground stat-number flex-shrink-0">
                            {new Date(ev.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="section-box relative w-full max-w-sm p-6 shadow-elevated animate-in-up z-10 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">New Event</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="h-7 w-7 btn-press">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-label mb-1.5 block">Title</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Event name"
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label mb-1.5 block">Date</label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-label mb-1.5 block">Time</label>
                  <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-label mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewColor(c.value)}
                      title={c.name}
                      className={cn(
                        "w-7 h-7 rounded-md transition-all btn-press",
                        newColor === c.value ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-label mb-1.5 block">Notes</label>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleAdd}
                  disabled={!newTitle.trim() || !newDate}
                  className="flex-1 gradient-primary text-primary-foreground h-9 text-sm btn-press hover:shadow-hover"
                >
                  Add Event
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="h-9 text-sm btn-press">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Event row component ── */
function EventRow({
  event,
  onDelete,
  deleteConfirm,
  until,
}: {
  event: Event
  onDelete: (id: string) => void
  deleteConfirm: string | null
  until: string | null
}) {
  return (
    <div className="flex items-start gap-3 py-2 group">
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: event.color || "#334155" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{event.title}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {event.time && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <Clock className="w-3 h-3" />
              {event.time}
            </span>
          )}
          {until ? (
            <span className="text-xs font-medium" style={{ color: event.color || "#334155" }}>
              in {until}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Past</span>
          )}
        </div>
        {event.note && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{event.note}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(event.id)}
        className={cn(
          "h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all",
          deleteConfirm === event.id
            ? "opacity-100 text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        )}
        title={deleteConfirm === event.id ? "Click again to delete" : "Delete"}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
