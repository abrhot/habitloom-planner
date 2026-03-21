"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, CheckCircle2, Circle } from "lucide-react"
import type { Challenge } from "@/lib/types"
import { getChallenges, getChallengeLogsForChallenge, toggleChallengeLog, calculateStreakFromDates } from "@/lib/data"
import { ConsistencyGrid } from "./consistency-grid"
import { getToday } from "@/lib/date-utils"
import { getCurrentUser } from "@/lib/auth"

interface ChallengeDetailModalProps {
  challengeId: string
  userId: string
  onClose: () => void
}

export function ChallengeDetailModal({ challengeId, userId, onClose }: ChallengeDetailModalProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [streak, setStreak] = useState({ current: 0, longest: 0, total: 0 })
  const [todayDone, setTodayDone] = useState(false)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const challenges = await getChallenges(userId)
    const found = challenges.find((c) => c.id === challengeId)
    if (!found) return

    setChallenge(found)

    const dates = await getChallengeLogsForChallenge(challengeId)
    setStreak(calculateStreakFromDates(dates))
    setTodayDone(dates.includes(getToday()))
    setLoading(false)
  }, [challengeId, userId])

  useEffect(() => { load() }, [load])

  const handleToggle = async () => {
    const user = await getCurrentUser()
    if (!user) return
    await toggleChallengeLog(challengeId, user.id, getToday())
    load()
  }

  if (loading || !challenge) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin z-10" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="section-box relative w-full max-w-xl shadow-elevated my-8 z-10 animate-in-up overflow-hidden">

        {/* Color accent bar */}
        <div className="h-1" style={{ backgroundColor: challenge.color }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">{challenge.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Started {new Date(challenge.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 flex-shrink-0 btn-press">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Streak numbers */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-secondary rounded-lg px-4 py-3">
              <p className="text-2xl font-semibold text-foreground stat-number leading-none">{streak.current}</p>
              <p className="text-label mt-1">Current</p>
            </div>
            <div className="bg-secondary rounded-lg px-4 py-3">
              <p className="text-2xl font-semibold text-foreground stat-number leading-none">{streak.longest}</p>
              <p className="text-label mt-1">Best</p>
            </div>
            <div className="bg-secondary rounded-lg px-4 py-3">
              <p className="text-2xl font-semibold text-foreground stat-number leading-none">{streak.total}</p>
              <p className="text-label mt-1">Total days</p>
            </div>
          </div>

          {/* Consistency grid */}
          <div className="mb-5">
            <p className="text-label mb-3">12-Week Consistency</p>
            <ConsistencyGrid challengeId={challengeId} color={challenge.color} onUpdate={load} />
          </div>

          {/* Today check-in */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-label">Today</p>
              <Button
                onClick={handleToggle}
                size="sm"
                variant={todayDone ? "default" : "outline"}
                className={`h-7 text-xs px-3 gap-1.5 btn-press ${todayDone ? "gradient-primary text-primary-foreground" : ""}`}
              >
                {todayDone
                  ? <><CheckCircle2 className="w-3.5 h-3.5" /> Completed</>
                  : <><Circle className="w-3.5 h-3.5" /> Mark done</>
                }
              </Button>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it go today? (optional note)"
              className="resize-none text-sm"
              rows={2}
            />
          </div>

          <Button onClick={onClose} variant="outline" className="w-full mt-4 h-9 text-sm btn-press">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
