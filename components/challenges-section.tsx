"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ChallengeForm } from "./challenge-form"
import { ChallengeCard } from "./challenge-card"
import type { Challenge, StreakInfo } from "@/lib/types"
import { getChallenges, createChallenge, archiveChallenge, getChallengeLogsForChallenge, calculateStreakFromDates } from "@/lib/data"

interface ChallengesSectionProps {
  userId: string
  onChallengeClick: (challengeId: string) => void
}

type ChallengeWithStreak = Challenge & { streak: StreakInfo }

export function ChallengesSection({ userId, onChallengeClick }: ChallengesSectionProps) {
  const [challenges, setChallenges] = useState<ChallengeWithStreak[]>([])
  const [showForm, setShowForm] = useState(false)

  const loadChallenges = useCallback(async () => {
    const data = await getChallenges(userId)
    const active = data.filter((c) => !c.archivedAt)
    const withStreaks = await Promise.all(
      active.map(async (c) => {
        const dates = await getChallengeLogsForChallenge(c.id)
        return { ...c, streak: calculateStreakFromDates(dates) }
      })
    )
    setChallenges(withStreaks)
  }, [userId])

  useEffect(() => { loadChallenges() }, [loadChallenges])

  const handleCreateChallenge = async (title: string, color: string) => {
    await createChallenge(userId, title, color)
    loadChallenges()
    setShowForm(false)
  }

  const handleArchive = async (id: string) => {
    await archiveChallenge(id)
    loadChallenges()
  }

  return (
    <>
      <div className="section-box p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Challenges</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowForm(true)} className="h-8 w-8 btn-press">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">No challenges yet. Create your first.</p>
            <Button onClick={() => setShowForm(true)} variant="outline" className="btn-press">
              <Plus className="h-3.5 w-3.5 mr-1.5" />Create challenge
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                streak={challenge.streak}
                onArchive={handleArchive}
                onClick={onChallengeClick}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && <ChallengeForm onSubmit={handleCreateChallenge} onCancel={() => setShowForm(false)} />}
    </>
  )
}
