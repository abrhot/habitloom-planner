"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { TodoItem } from "./todo-item"
import type { Todo } from "@/lib/types"
import { getTodos, createTodo, toggleTodo, deleteTodo } from "@/lib/data"

interface TodosSectionProps {
  userId: string
  currentDate: string
}

export function TodosSection({ userId, currentDate }: TodosSectionProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [userId, currentDate])

  const loadTodos = () => {
    const data = getTodos(userId, currentDate)
    setTodos(data)
  }

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodoText.trim()) {
      createTodo(userId, currentDate, newTodoText.trim())
      setNewTodoText("")
      setShowInput(false)
      loadTodos()
    }
  }

  const handleToggle = (id: string) => {
    toggleTodo(id)
    loadTodos()
  }

  const handleDelete = (id: string) => {
    deleteTodo(id)
    loadTodos()
  }

  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Today's Todos</h2>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed ({progress}%)
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowInput(true)} className="h-8 w-8" disabled={showInput}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add todo</span>
        </Button>
      </div>

      {totalCount > 0 && (
        <div className="mb-4">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} onUpdate={loadTodos} />
        ))}

        {showInput && (
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <Input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a new todo..."
              autoFocus
              onBlur={() => {
                if (!newTodoText.trim()) {
                  setShowInput(false)
                }
              }}
            />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
        )}

        {todos.length === 0 && !showInput && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4 text-pretty">
              No todos for today. Add a task to get started.
            </p>
            <Button onClick={() => setShowInput(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add todo
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
