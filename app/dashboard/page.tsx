"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getChallenges, getEvents, calculateStreak, archiveChallenge, createChallenge } from "@/lib/data"
import type { User, Challenge, Event } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { QuoteOfDay } from "@/components/quote-of-day"
import { WelcomeModal } from "@/components/welcome-modal"
import { ChallengeCard } from "@/components/challenge-card"
import { ChallengeDetailModal } from "@/components/challenge-detail-modal"
import { EventCountdown } from "@/components/event-countdown"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChallengeForm } from "@/components/challenge-form"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)

    // Check if this is the user's first visit
    const hasSeenWelcome = localStorage.getItem("habitloom_seen_welcome")
    if (!hasSeenWelcome) {
      setShowWelcome(true)
      localStorage.setItem("habitloom_seen_welcome", "true")
    }

    // Load challenges and events
    loadData(currentUser.id)
  }, [router])

  const loadData = (userId: string) => {
    const userChallenges = getChallenges(userId).filter((c) => !c.archived)
    setChallenges(userChallenges)
    setEvents(getEvents(userId))
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
