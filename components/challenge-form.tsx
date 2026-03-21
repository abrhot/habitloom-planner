"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface ChallengeFormProps {
  onSubmit: (title: string, color: string) => void
  onCancel: () => void
}

const PRESET_COLORS = [
  "#ef4444","#f97316","#f59e0b","#eab308",
  "#84cc16","#22c55e","#10b981","#14b8a6",
  "#06b6d4","#0ea5e9","#3b82f6","#6366f1",
  "#8b5cf6","#a855f7","#d946ef","#ec4899",
]

export function ChallengeForm({ onSubmit, onCancel }: ChallengeFormProps) {
  const [title, setTitle] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[11])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) onSubmit(title.trim(), color)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <Card className="relative w-full max-w-sm p-6 shadow-elevated animate-in-up z-10 rounded-lg">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">New Challenge</h2>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Challenge Name
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning meditation, Daily run..."
              required
              autoFocus
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Color</Label>
              <div className="w-5 h-5 rounded" style={{ backgroundColor: color }} />
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded transition-all hover:scale-110 ${
                    color === c ? "ring-2 ring-offset-1 ring-foreground scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-9 text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 h-9 text-sm gradient-primary text-primary-foreground hover:opacity-90"
            >
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
