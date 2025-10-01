"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Challenge, StreakInfo } from "@/lib/types"
import { Archive, Flame } from "lucide-react"

interface ChallengeCardProps {
  challenge: Challenge
  streak?: StreakInfo // Made streak optional to handle undefined cases
  onArchive: (id: string) => void
  onClick: (id: string) => void
}

export function ChallengeCard({ challenge, streak, onArchive, onClick }: ChallengeCardProps) {
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  const currentStreak = streak?.current ?? 0
  const longestStreak = streak?.longest ?? 0

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showArchiveConfirm) {
      onArchive(challenge.id)
    } else {
      setShowArchiveConfirm(true)
      setTimeout(() => setShowArchiveConfirm(false), 3000)
    }
  }

  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick(challenge.id)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: challenge.color }}
            aria-hidden="true"
          />
          <h3 className="font-medium truncate">{challenge.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleArchive}
          className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Archive className="h-4 w-4" />
          <span className="sr-only">Archive challenge</span>
        </Button>
      </div>

      {showArchiveConfirm && <p className="text-xs text-destructive mb-2">Click again to confirm archive</p>}

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-medium">{currentStreak}</span>
          <span className="text-muted-foreground">day streak</span>
        </div>
        {longestStreak > 0 && <div className="text-muted-foreground">Best: {longestStreak}</div>}
      </div>
    </Card>
  )
}
