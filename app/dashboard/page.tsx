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
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name}</h1>
            <p className="text-muted-foreground">Track your habits and stay consistent</p>
          </div>

          <QuoteOfDay />

          <div className="flex justify-start">
            <Button
              onClick={() => setShowChallengeForm(true)}
              size="lg"
              className="hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Challenge
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Today's Tasks</h2>
                </div>
                <Link href="/todos">
                  <Button variant="ghost" size="sm" className="hover:bg-secondary">
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
                    <span className="font-medium">{Math.round((completedTodos / totalTodos) * 100)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-foreground h-full rounded-full transition-all"
                      style={{ width: `${(completedTodos / totalTodos) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {todayTodos.slice(0, 3).map((todo) => (
                      <div key={todo.id} className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                            todo.completed ? "bg-foreground border-foreground" : "border-muted-foreground"
                          }`}
                        />
                        <span className={todo.completed ? "line-through text-muted-foreground" : ""}>{todo.text}</span>
                      </div>
                    ))}
                    {totalTodos > 3 && <p className="text-xs text-muted-foreground">+{totalTodos - 3} more tasks</p>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">No tasks for today</p>
                  <Link href="/todos">
                    <Button size="sm" variant="outline" className="hover:bg-secondary bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card className="p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Upcoming Events</h2>
                </div>
                <Link href="/events">
                  <Button variant="ghost" size="sm" className="hover:bg-secondary">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              {events.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {events.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg p-3 border transition-colors hover:bg-secondary/50"
                      style={{
                        backgroundColor: `${event.color}15`,
                        borderColor: `${event.color}40`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{event.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                          {event.note && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.note}</p>
                          )}
                        </div>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: event.color }}
                        />
                      </div>
                    </div>
                  ))}
                  {events.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">+{events.length - 5} more events</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">No events scheduled</p>
                  <Link href="/events">
                    <Button size="sm" variant="outline" className="hover:bg-secondary bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Your Challenges</h2>

            {challenges.length === 0 ? (
              <Card className="p-8 text-center border shadow-sm">
                <p className="text-muted-foreground mb-4">
                  No challenges yet. Create your first challenge to get started!
                </p>
                <Button onClick={() => setShowChallengeForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    streak={calculateStreak(challenge.id)}
                    onArchive={handleArchive}
                    onClick={() => setSelectedChallenge(challenge.id)}
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
        <ChallengeDetailModal
          challengeId={selectedChallenge}
          userId={user.id}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  )
}
