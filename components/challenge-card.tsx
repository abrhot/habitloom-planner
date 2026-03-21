"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Challenge, StreakInfo } from "@/lib/types"
import { Archive } from "lucide-react"
import { ConsistencyGrid } from "./consistency-grid"

interface ChallengeCardProps {
  challenge: Challenge
  streak?: StreakInfo
  onArchive: (id: string) => void
  onClick: (id: string) => void
  showGrid?: boolean
}

export function ChallengeCard({ challenge, streak, onArchive, onClick, showGrid = false }: ChallengeCardProps) {
  const [confirmArchive, setConfirmArchive] = useState(false)

  const current = streak?.current ?? 0
  const longest = streak?.longest ?? 0

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmArchive) {
      onArchive(challenge.id)
    } else {
      setConfirmArchive(true)
      setTimeout(() => setConfirmArchive(false), 3000)
    }
  }

  return (
    <div
      className="section-box card-hover overflow-hidden cursor-pointer group"
      onClick={() => onClick(challenge.id)}
    >
      {/* Top accent bar */}
      <div className="h-1 rounded-t-lg" style={{ backgroundColor: challenge.color }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{challenge.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Since {new Date(challenge.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleArchive}
            className={`h-7 w-7 flex-shrink-0 transition-all ${
              confirmArchive
                ? "text-destructive bg-destructive/10 opacity-100"
                : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
            }`}
            title={confirmArchive ? "Click again to archive" : "Archive"}
          >
            <Archive className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Streak numbers */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-secondary rounded-md px-3 py-2">
            <p className="text-lg font-semibold text-foreground tabular-nums leading-none">{current}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">Streak</p>
          </div>
          <div className="flex-1 bg-secondary rounded-md px-3 py-2">
            <p className="text-lg font-semibold text-foreground tabular-nums leading-none">{longest}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">Best</p>
          </div>
        </div>

        {showGrid && (
          <div className="pt-3 border-t border-border">
            <ConsistencyGrid challengeId={challenge.id} color={challenge.color} />
          </div>
        )}
      </div>
    </div>
  )
}
