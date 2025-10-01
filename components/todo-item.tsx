"use client"

import type React from "react"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Todo } from "@/lib/types"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showDeleteConfirm) {
      onDelete(todo.id)
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  return (
    <div className="flex items-start gap-3 group">
      <Checkbox id={todo.id} checked={todo.completed} onCheckedChange={() => onToggle(todo.id)} className="mt-0.5" />
      <label
        htmlFor={todo.id}
        className={`flex-1 text-sm cursor-pointer transition-colors ${
          todo.completed ? "line-through text-muted-foreground" : ""
        }`}
      >
        {todo.text}
      </label>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
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
