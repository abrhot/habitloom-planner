"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Bot, Sparkles, Plus, CalendarPlus } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { addEvent, createChallenge } from "@/lib/data"
import type { User } from "@/lib/types"

type ChatRole = "user" | "assistant"
type ChatMessage = { role: ChatRole; content: string }

type ChallengeSuggestion = { title: string; color?: string }
type EventSuggestion = { title: string; date?: string; note?: string; color?: string }

export default function AIPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I can help you build roadmaps, convert them into trackable challenges, and suggest event ideas based on your schedule. Paste your goal or roadmap to start.",
    },
  ])
  const [challengeSuggestions, setChallengeSuggestions] = useState<ChallengeSuggestion[]>([])
  const [eventSuggestions, setEventSuggestions] = useState<EventSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState<string | null>(null)
  const [addingEvent, setAddingEvent] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push("/")
        return
      }
      setUser(u)
    })
  }, [router])

  const quickPrompts = useMemo(
    () => [
      "Create a 6-week React roadmap from scratch and suggest challenges.",
      "Turn this roadmap into daily/weekly challenges: [paste roadmap here]",
      "Based on my upcoming events, suggest important global tech events to consider adding.",
    ],
    []
  )

  async function sendMessage() {
    const text = prompt.trim()
    if (!text || !user || loading) return

    setLoading(true)
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setPrompt("")

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = (await res.json()) as {
        reply?: string
        suggestedChallenges?: ChallengeSuggestion[]
        suggestedEvents?: EventSuggestion[]
        error?: string
      }

      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Failed to get AI response")
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }])
      setChallengeSuggestions(data.suggestedChallenges ?? [])
      setEventSuggestions(data.suggestedEvents ?? [])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not process that right now. Please try again. You can still ask me to generate roadmap-based challenges.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateChallenge(item: ChallengeSuggestion) {
    if (!user) return
    setCreating(item.title)
    try {
      await createChallenge(user.id, item.title, item.color || "#4f46e5")
    } finally {
      setCreating(null)
    }
  }

  async function handleAddEvent(item: EventSuggestion) {
    if (!user || !item.date) return
    setAddingEvent(item.title)
    try {
      await addEvent(user.id, {
        title: item.title,
        date: item.date,
        note: item.note,
        color: item.color || "#0284c7",
      })
    } finally {
      setAddingEvent(null)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-label mb-1">Assistant</p>
              <h1 className="text-2xl font-semibold">AI Roadmap Coach</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Build learning plans, generate challenges, and get event recommendations.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card className="section-box p-0 overflow-hidden">
              <div className="border-b border-border px-5 py-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Chat</p>
              </div>

              <div className="px-5 py-4 space-y-3 min-h-[340px] max-h-[520px] overflow-y-auto">
                {messages.map((m, idx) => (
                  <div
                    key={`${m.role}-${idx}`}
                    className={m.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]"}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? "rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm"
                          : "rounded-lg bg-secondary text-foreground px-3 py-2 text-sm"
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-5 py-4 space-y-3">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your goal or paste a roadmap..."
                  className="min-h-[96px] text-sm"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="hidden md:flex flex-wrap gap-2">
                    {quickPrompts.map((q) => (
                      <button
                        key={q}
                        onClick={() => setPrompt(q)}
                        className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        Use template
                      </button>
                    ))}
                  </div>
                  <Button className="btn-press" onClick={sendMessage} disabled={loading}>
                    {loading ? "Thinking..." : "Send"}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="section-box p-4">
                <p className="text-sm font-semibold mb-3">Suggested Challenges</p>
                <div className="space-y-2">
                  {challengeSuggestions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No suggestions yet.</p>
                  )}
                  {challengeSuggestions.map((c) => (
                    <div key={c.title} className="border border-border rounded-lg p-3">
                      <p className="text-sm mb-2">{c.title}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full btn-press"
                        onClick={() => handleCreateChallenge(c)}
                        disabled={creating === c.title}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        {creating === c.title ? "Creating..." : "Create Challenge"}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="section-box p-4">
                <p className="text-sm font-semibold mb-3">Suggested Events</p>
                <div className="space-y-2">
                  {eventSuggestions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No event suggestions yet.</p>
                  )}
                  {eventSuggestions.map((e) => (
                    <div key={`${e.title}-${e.date ?? "na"}`} className="border border-border rounded-lg p-3">
                      <p className="text-sm">{e.title}</p>
                      {e.date && <p className="text-xs text-muted-foreground mt-1">Date: {e.date}</p>}
                      {e.note && <p className="text-xs text-muted-foreground mt-1">{e.note}</p>}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 btn-press"
                        onClick={() => handleAddEvent(e)}
                        disabled={!e.date || addingEvent === e.title}
                      >
                        <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
                        {!e.date
                          ? "No date provided"
                          : addingEvent === e.title
                            ? "Adding..."
                            : "Add Event"}
                      </Button>
                    </div>
                  ))}
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
