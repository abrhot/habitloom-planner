"use client"

import type React from "react"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Clock } from "lucide-react"
import type { Todo } from "@/lib/types"
import { updateTodo } from "@/lib/data"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate?: () => void
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showTimeInput, setShowTimeInput] = useState(false)
  const [timeValue, setTimeValue] = useState(todo.time || "")

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showDeleteConfirm) {
      onDelete(todo.id)
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const handleTimeUpdate = () => {
    updateTodo(todo.id, { time: timeValue || undefined })
    setShowTimeInput(false)
    onUpdate?.()
  }

  return (
    <div className="flex items-start gap-3 group bg-secondary/30 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
      <Checkbox
        id={todo.id}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-0.5 h-5 w-5 border-2"
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={todo.id}
          className={`block text-sm cursor-pointer transition-colors ${
            todo.completed ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {todo.text}
        </label>
        {showTimeInput ? (
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="h-7 text-xs"
              autoFocus
            />
            <Button size="sm" onClick={handleTimeUpdate} className="h-7 text-xs">
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowTimeInput(false)} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            {todo.time ? (
              <button
                onClick={() => setShowTimeInput(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Clock className="w-3 h-3" />
                {todo.time}
              </button>
            ) : (
              <button
                onClick={() => setShowTimeInput(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              >
                <Clock className="w-3 h-3" />
                Add time
              </button>
            )}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Delete todo</span>
      </Button>
      {showDeleteConfirm && (
        <span className="text-xs text-destructive absolute right-0 -mt-6">Click again to delete</span>
      )}
    </div>
  )
}
