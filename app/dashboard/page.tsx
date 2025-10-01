"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getChallenges, getEvents, getTodos, calculateStreak, archiveChallenge, createChallenge } from "@/lib/data"
import type { User, Challenge, Event, Todo } from "@/lib/types"
import { getToday } from "@/lib/date-utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { QuoteOfDay } from "@/components/quote-of-day"
import { WelcomeModal } from "@/components/welcome-modal"
import { ChallengeCard } from "@/components/challenge-card"
import { ChallengeDetailModal } from "@/components/challenge-detail-modal"
import { EventCountdown } from "@/components/event-countdown"
import { Plus, Calendar, CheckSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChallengeForm } from "@/components/challenge-form"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [todayTodos, setTodayTodos] = useState<Todo[]>([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)

    const hasSeenWelcome = localStorage.getItem("habitloom_seen_welcome")
    if (!hasSeenWelcome) {
      setShowWelcome(true)
      localStorage.setItem("habitloom_seen_welcome", "true")
    }

    loadData(currentUser.id)
  }, [router])

  const loadData = (userId: string) => {
    const userChallenges = getChallenges(userId).filter((c) => !c.archived)
    setChallenges(userChallenges)
    setEvents(getEvents(userId))
    const today = getToday()
    setTodayTodos(getTodos(userId, today))
  }

  const handleArchive = (challengeId: string) => {
    if (user) {
      archiveChallenge(challengeId)
      loadData(user.id)
    }
  }

  const handleCreateChallenge = (title: string, color: string) => {
    if (user) {
      createChallenge(user.id, title, color)
      setShowChallengeForm(false)
      loadData(user.id)
    }
  }

  const completedTodos = todayTodos.filter((t) => t.completed).length
  const totalTodos = todayTodos.length

  const today = getToday()
  const todayEvents = events.filter((e) => e.date === today)

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name}</h1>
            <p className="text-muted-foreground">Track your habits and stay consistent</p>
          </div>

          <QuoteOfDay />

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Today's Tasks</h2>
                </div>
                <Link href="/todos">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              {totalTodos > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {completedTodos} of {totalTodos} completed
                    </span>
                    <span className="font-medium text-primary">{Math.round((completedTodos / totalTodos) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${(completedTodos / totalTodos) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {todayTodos.slice(0, 3).map((todo) => (
                      <div key={todo.id} className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                            todo.completed ? "bg-primary border-primary" : "border-muted-foreground"
                          }`}
                        />
                        <span className={todo.completed ? "line-through text-muted-foreground" : ""}>{todo.text}</span>
                      </div>
                    ))}
                    {totalTodos > 3 && <p className="text-xs text-muted-foreground">+{totalTodos - 3} more tasks</p>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">No tasks for today</p>
                  <Link href="/todos">
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Today's Events</h2>
                </div>
                <Link href="/events">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              {todayEvents.length > 0 ? (
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {todayEvents.map((event) => (
                    <div key={event.id} className="bg-secondary/50 rounded-lg p-3 border border-border">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      {event.note && <p className="text-xs text-muted-foreground mt-1">{event.note}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">No events scheduled for today</p>
                  <Link href="/events">
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Your Challenges</h2>
                <Button
                  onClick={() => setShowChallengeForm(true)}
                  size="sm"
                  className="hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Challenge
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {challenges.length === 0 ? (
                  <div className="col-span-2 bg-card rounded-lg border border-border p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      No challenges yet. Create your first challenge to get started!
                    </p>
                    <Button onClick={() => setShowChallengeForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Challenge
                    </Button>
                  </div>
                ) : (
                  challenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      streak={calculateStreak(challenge.id)}
                      onArchive={handleArchive}
                      onClick={() => setSelectedChallenge(challenge.id)}
                      showGrid={true}
                    />
                  ))
                )}
              </div>
            </div>

            <EventCountdown events={events} />
          </div>
        </div>
      </main>

      <Footer />

      {showWelcome && <WelcomeModal userName={user.name} onClose={() => setShowWelcome(false)} />}

      {showChallengeForm && (
        <ChallengeForm onSubmit={handleCreateChallenge} onCancel={() => setShowChallengeForm(false)} />
      )}

      {selectedChallenge && (
        <ChallengeDetailModal
          challengeId={selectedChallenge}
          userId={user.id}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  )
}
