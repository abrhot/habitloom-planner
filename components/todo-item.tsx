"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Clock, Flag } from "lucide-react"
import type { Todo, TodoPriority } from "@/lib/types"
import { updateTodo } from "@/lib/data"
import { cn } from "@/lib/utils"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate?: () => void
}

const priorityConfig: Record<TodoPriority, { label: string; color: string; bg: string; border: string }> = {
  high: { label: "High", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800" },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  low: { label: "Low", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800" },
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [showTimeInput, setShowTimeInput] = useState(false)
  const [timeValue, setTimeValue] = useState(todo.time || "")
  const [isDeleting, setIsDeleting] = useState(false)

  const priority = todo.priority ?? "medium"
  const pConfig = priorityConfig[priority]

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDeleting) {
      onDelete(todo.id)
    } else {
      setIsDeleting(true)
      setTimeout(() => setIsDeleting(false), 2500)
    }
  }

  const handleTimeUpdate = async () => {
    await updateTodo(todo.id, { time: timeValue || undefined })
    setShowTimeInput(false)
    onUpdate?.()
  }

  const cyclePriority = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const order: TodoPriority[] = ["low", "medium", "high"]
    const next = order[(order.indexOf(priority) + 1) % order.length]
    await updateTodo(todo.id, { priority: next })
    onUpdate?.()
  }

  return (
    <div className={cn(
      "flex items-start gap-3 group p-3 rounded-xl border transition-all duration-200",
      "hover:shadow-sm",
      todo.completed ? "opacity-60 bg-muted/30" : "bg-card",
      pConfig.border
    )}>
      {/* Custom Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={cn(
          "mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200",
          todo.completed
            ? "bg-foreground border-foreground"
            : "border-muted-foreground/40 hover:border-foreground"
        )}
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-relaxed transition-all",
          todo.completed ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {todo.text}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Priority badge */}
          <button
            onClick={cyclePriority}
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition-all hover:scale-105",
              pConfig.bg, pConfig.color
            )}
            title="Click to change priority"
          >
            <Flag className="w-2.5 h-2.5" />
            {pConfig.label}
          </button>

          {/* Time */}
          {showTimeInput ? (
            <div className="flex items-center gap-1.5">
              <Input
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="h-6 text-xs w-28 px-2"
                autoFocus
              />
              <Button size="sm" onClick={handleTimeUpdate} className="h-6 text-xs px-2">
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowTimeInput(false)} className="h-6 text-xs px-2">
                ✕
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowTimeInput(true)}
              className={cn(
                "flex items-center gap-1 text-xs transition-all",
                todo.time
                  ? "text-primary font-medium"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary"
              )}
            >
              <Clock className="w-3 h-3" />
              {todo.time || "Add time"}
            </button>
          )}
        </div>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className={cn(
          "h-7 w-7 flex-shrink-0 transition-all",
          isDeleting
            ? "opacity-100 text-destructive bg-destructive/10"
            : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        )}
        title={isDeleting ? "Click again to confirm" : "Delete"}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
