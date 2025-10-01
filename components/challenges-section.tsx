"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ChallengeForm } from "./challenge-form"
import { ChallengeCard } from "./challenge-card"
import type { Challenge } from "@/lib/types"
import { getChallenges, createChallenge, archiveChallenge, calculateStreak } from "@/lib/data"

interface ChallengesSectionProps {
  userId: string
  onChallengeClick: (challengeId: string) => void
}

export function ChallengesSection({ userId, onChallengeClick }: ChallengesSectionProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadChallenges()
  }, [userId])

  const loadChallenges = () => {
    const data = getChallenges(userId)
    setChallenges(data)
  }

  const handleCreateChallenge = (title: string, color: string) => {
    createChallenge(userId, title, color)
    loadChallenges()
    setShowForm(false)
  }

  const handleArchive = (id: string) => {
    archiveChallenge(id)
    loadChallenges()
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Challenges</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowForm(true)} className="h-8 w-8">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add challenge</span>
          </Button>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4 text-pretty">
              No challenges yet. Create your first challenge to start tracking your consistency.
            </p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create challenge
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const streak = calculateStreak(challenge.id)
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  streak={streak}
                  onArchive={handleArchive}
                  onClick={onChallengeClick}
                />
              )
            })}
          </div>
        )}
      </Card>

      {showForm && <ChallengeForm onSubmit={handleCreateChallenge} onCancel={() => setShowForm(false)} />}
    </>
  )
}
