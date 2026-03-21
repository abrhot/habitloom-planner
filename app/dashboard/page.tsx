"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import {
  getChallenges, getEvents, getTodos,
  getChallengeLogsForChallenge, calculateStreakFromDates,
  archiveChallenge, createChallenge,
} from "@/lib/data"
import type { User, Challenge, Event, Todo } from "@/lib/types"
import { getToday } from "@/lib/date-utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { QuoteOfDay } from "@/components/quote-of-day"
import { WelcomeModal } from "@/components/welcome-modal"
import { ChallengeCard } from "@/components/challenge-card"
import { ChallengeDetailModal } from "@/components/challenge-detail-modal"
import { Plus, CheckSquare, ArrowRight, Flame, TrendingUp, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChallengeForm } from "@/components/challenge-form"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { StreakInfo } from "@/lib/types"

type ChallengeWithStreak = Challenge & { streak: StreakInfo }

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [challenges, setChallenges] = useState<ChallengeWithStreak[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [todayTodos, setTodayTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async (userId: string) => {
    const [rawChallenges, eventsData, todosData] = await Promise.all([
      getChallenges(userId),
      getEvents(userId),
      getTodos(userId, getToday()),
    ])

    const active = rawChallenges.filter((c) => !c.archivedAt)
    const withStreaks = await Promise.all(
      active.map(async (c) => {
        const dates = await getChallengeLogsForChallenge(c.id)
        return { ...c, streak: calculateStreakFromDates(dates) }
      })
    )

    setChallenges(withStreaks)
    setEvents(eventsData)
    setTodayTodos(todosData)
  }, [])

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      if (!currentUser) { router.push("/"); return }
      setUser(currentUser)
      const hasSeenWelcome = localStorage.getItem("habitloom_seen_welcome")
      if (!hasSeenWelcome) {
        setShowWelcome(true)
        localStorage.setItem("habitloom_seen_welcome", "true")
      }
      loadData(currentUser.id).finally(() => setLoading(false))
    })
  }, [router, loadData])

  const handleArchive = async (id: string) => {
    await archiveChallenge(id)
    if (user) loadData(user.id)
  }

  const handleCreateChallenge = async (title: string, color: string) => {
    if (!user) return
    await createChallenge(user.id, title, color)
    setShowChallengeForm(false)
    loadData(user.id)
  }

  const done    = todayTodos.filter((t) => t.completed).length
  const total   = todayTodos.length
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0
  const today   = getToday()

  const upcoming = [...events]
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const totalStreak = challenges.reduce((s, c) => s + (c.streak.current ?? 0), 0)
  const bestStreak  = challenges.reduce((m, c) => Math.max(m, c.streak.longest ?? 0), 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── Header ── */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-label mb-1">{greeting()}</p>
              <h1 className="text-2xl font-semibold text-foreground leading-tight">{user.name}</h1>
            </div>
            <Button
              onClick={() => setShowChallengeForm(true)}
              className="gradient-primary text-primary-foreground h-9 px-4 text-sm btn-press shadow-card hover:shadow-hover"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Challenge
            </Button>
          </div>

          {/* ── Quote ── */}
          <QuoteOfDay />

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Current Streak" value={totalStreak} unit="days" accent icon={<Flame className="w-4 h-4" />} />
            <StatCard label="Best Streak"    value={bestStreak}           unit="days"       icon={<TrendingUp className="w-4 h-4" />} />
            <StatCard label="Tasks Today"    value={`${done}/${total}`}   unit={`${pct}% done`} icon={<CheckSquare className="w-4 h-4" />} />
            <StatCard label="Challenges"     value={challenges.length}    unit="active"     icon={<Target className="w-4 h-4" />} />
          </div>

          {/* ── Tasks + Events ── */}
          <div className="grid gap-4 md:grid-cols-2">

            {/* Today's tasks */}
            <div className="section-box overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Today's Tasks</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
                <Link href="/todos">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 btn-press">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              <div className="px-5 py-4">
                {total > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{done} of {total} completed</span>
                        <span className="font-semibold text-foreground stat-number">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {todayTodos.slice(0, 5).map((t) => (
                        <div key={t.id} className="row-hover flex items-center gap-2.5 px-2 py-1.5">
                          <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                            t.completed ? "bg-foreground border-foreground" : "border-muted-foreground/40"
                          }`}>
                            {t.completed && (
                              <svg className="w-2.5 h-2.5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm flex-1 truncate ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {t.text}
                          </span>
                          {t.time && <span className="text-xs text-muted-foreground stat-number">{t.time}</span>}
                        </div>
                      ))}
                      {total > 5 && <p className="text-xs text-muted-foreground px-2 pt-1">+{total - 5} more</p>}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">No tasks for today</p>
                    <Link href="/todos">
                      <Button size="sm" variant="outline" className="h-8 text-xs btn-press">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />Add a task
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming events */}
            <div className="section-box overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Upcoming Events</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{upcoming.length} scheduled</p>
                </div>
                <Link href="/events">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 btn-press">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              <div className="px-5 py-4">
                {upcoming.length > 0 ? (
                  <div className="space-y-0.5">
                    {upcoming.map((ev) => (
                      <Link key={ev.id} href="/events">
                        <div className="row-hover flex items-center gap-3 px-2 py-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || "#0f172a" }} />
                          <p className="text-sm font-medium text-foreground truncate flex-1">{ev.title}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {ev.time && <span className="text-xs text-muted-foreground stat-number">{ev.time}</span>}
                            <span className="text-xs text-muted-foreground stat-number">
                              {new Date(ev.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            {ev.date === today && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-foreground text-background">Today</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">No upcoming events</p>
                    <Link href="/events">
                      <Button size="sm" variant="outline" className="h-8 text-xs btn-press">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />Add an event
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Challenges ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Challenges</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{challenges.length} active</p>
              </div>
            </div>

            {challenges.length === 0 ? (
              <div className="section-box p-10 text-center">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Target className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-1">No challenges yet</h3>
                <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
                  Create a challenge to track your consistency and build lasting habits.
                </p>
                <Button
                  onClick={() => setShowChallengeForm(true)}
                  className="gradient-primary text-primary-foreground h-9 px-4 text-sm btn-press shadow-card"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Create a challenge
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {challenges.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    streak={c.streak}
                    onArchive={handleArchive}
                    onClick={() => setSelectedChallenge(c.id)}
                    showGrid={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showWelcome && <WelcomeModal userName={user.name} onClose={() => setShowWelcome(false)} />}
      {showChallengeForm && (
        <ChallengeForm onSubmit={handleCreateChallenge} onCancel={() => setShowChallengeForm(false)} />
      )}
      {selectedChallenge && (
        <ChallengeDetailModal challengeId={selectedChallenge} userId={user.id} onClose={() => setSelectedChallenge(null)} />
      )}
    </div>
  )
}

function StatCard({ label, value, unit, icon, accent }: {
  label: string; value: string | number; unit: string; icon: React.ReactNode; accent?: boolean
}) {
  return (
    <div className="section-box p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-label">{label}</span>
        <div className={cn(
          "w-7 h-7 rounded flex items-center justify-center transition-colors",
          accent ? "bg-amber-soft text-amber" : "bg-secondary text-muted-foreground",
        )}>{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-foreground stat-number leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{unit}</p>
    </div>
  )
}
