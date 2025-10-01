"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, X } from "lucide-react"
import type { Event } from "@/lib/types"

interface EventItemProps {
  event: Event
  onDelete: (id: string) => void
}

export function EventItem({ event, onDelete }: EventItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showDeleteConfirm) {
      onDelete(event.id)
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  return (
    <div className="flex items-start gap-3 group p-2 rounded-md hover:bg-accent/50 transition-colors relative">
      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
      <p className="flex-1 text-sm">{event.title}</p>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Delete event</span>
      </Button>
      {showDeleteConfirm && (
        <span className="text-xs text-destructive absolute right-0 -mt-6">Click again to delete</span>
      )}
    </div>
  )
}
