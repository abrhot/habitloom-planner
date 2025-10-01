"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Flame } from "lucide-react"
import type { Challenge } from "@/lib/types"
import { getChallenges, getChallengeDays, toggleChallengeDay, calculateStreak } from "@/lib/data"
import { ConsistencyGrid } from "./consistency-grid"
import { getToday } from "@/lib/date-utils"

interface ChallengeDetailModalProps {
  challengeId: string
  userId: string
  onClose: () => void
}

export function ChallengeDetailModal({ challengeId, userId, onClose }: ChallengeDetailModalProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [todayNote, setTodayNote] = useState("")
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [todayCompleted, setTodayCompleted] = useState(false)

  useEffect(() => {
    loadChallenge()
  }, [challengeId, userId])

  const loadChallenge = () => {
    const challenges = getChallenges(userId)
    const found = challenges.find((c) => c.id === challengeId)
    if (found) {
      setChallenge(found)
      const streakInfo = calculateStreak(challengeId)
      setStreak(streakInfo)

      const today = getToday()
      const days = getChallengeDays(challengeId)
      const todayDay = days.find((d) => d.date === today)
      setTodayCompleted(todayDay?.completed || false)
      setTodayNote(todayDay?.note || "")
    }
  }

  const handleToggleToday = () => {
    const today = getToday()
    toggleChallengeDay(challengeId, today, todayNote)
    loadChallenge()
  }

  const handleSaveNote = () => {
    const today = getToday()
    const days = getChallengeDays(challengeId)
    const todayDay = days.find((d) => d.date === today)

    if (todayDay) {
      toggleChallengeDay(challengeId, today, todayNote)
      toggleChallengeDay(challengeId, today, todayNote)
    } else if (todayNote.trim()) {
      toggleChallengeDay(challengeId, today, todayNote)
      toggleChallengeDay(challengeId, today, todayNote)
    }
  }

  if (!challenge) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-3xl p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: challenge.color }} aria-hidden="true" />
            <h2 className="text-2xl font-semibold">{challenge.title}</h2>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{streak.current}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
            {streak.longest > 0 && <div className="text-muted-foreground">Longest streak: {streak.longest} days</div>}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Consistency</h3>
          <ConsistencyGrid challengeId={challengeId} color={challenge.color} onUpdate={loadChallenge} />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Today</h3>
            <Button
              onClick={handleToggleToday}
              variant={todayCompleted ? "default" : "outline"}
              size="sm"
              className={todayCompleted ? "" : "bg-transparent"}
            >
              {todayCompleted ? "Completed" : "Mark as done"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm text-muted-foreground">
              Add a note (optional)
            </Label>
            <Textarea
              id="note"
              value={todayNote}
              onChange={(e) => setTodayNote(e.target.value)}
              onBlur={handleSaveNote}
              placeholder="How did it go today?"
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </Card>
    </div>
  )
}
