"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Flag, Clock } from "lucide-react"
import { TodoItem } from "./todo-item"
import type { Todo, TodoPriority } from "@/lib/types"
import { getTodos, createTodo, toggleTodo, deleteTodo } from "@/lib/data"
import { cn } from "@/lib/utils"

interface TodosSectionProps {
  userId: string
  currentDate: string
}

const PRIORITY_OPTIONS: { value: TodoPriority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "text-red-600" },
  { value: "medium", label: "Medium", color: "text-amber-600" },
  { value: "low", label: "Low", color: "text-green-600" },
]

export function TodosSection({ userId, currentDate }: TodosSectionProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [newTodoTime, setNewTodoTime] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>("medium")
  const [showInput, setShowInput] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  useEffect(() => {
    loadTodos()
  }, [userId, currentDate])

  const loadTodos = () => {
    getTodos(userId, currentDate).then(setTodos)
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodoText.trim()) {
      await createTodo(userId, currentDate, newTodoText.trim(), newTodoTime || undefined, newTodoPriority)
      setNewTodoText("")
      setNewTodoTime("")
      setNewTodoPriority("medium")
      setShowInput(false)
      loadTodos()
    }
  }

  const handleToggle = async (id: string) => {
    await toggleTodo(id)
    loadTodos()
  }

  const handleDelete = async (id: string) => {
    await deleteTodo(id)
    loadTodos()
  }

  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed
    if (filter === "completed") return t.completed
    return true
  })

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const pa = priorityOrder[a.priority ?? "medium"]
    const pb = priorityOrder[b.priority ?? "medium"]
    if (pa !== pb) return pa - pb
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const highCount = todos.filter((t) => !t.completed && (t.priority ?? "medium") === "high").length

  return (
    <div className="space-y-4">
      {/* Progress box */}
      {totalCount > 0 && (
        <div className="section-box p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{completedCount} of {totalCount} tasks done</p>
              {highCount > 0 && (
                <p className="text-xs text-red-500 mt-0.5">{highCount} high priority remaining</p>
              )}
            </div>
            <span className="text-2xl font-semibold text-foreground stat-number">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-foreground h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="section-box p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">Tasks</h2>
            {totalCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {totalCount}
              </span>
            )}
          </div>
          <Button
            onClick={() => setShowInput(true)}
            className="gradient-primary text-primary-foreground h-9 text-sm btn-press hover:shadow-hover"
            disabled={showInput}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Task
          </Button>
        </div>

        {/* Filter tabs */}
        {totalCount > 0 && (
          <div className="flex gap-0.5 p-0.5 bg-muted rounded-md mb-4 w-fit">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded transition-all capitalize",
                  filter === f
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
                {f === "active" && todos.filter(t => !t.completed).length > 0 && (
                  <span className="ml-1 text-amber stat-number">{todos.filter(t => !t.completed).length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Add todo form */}
        {showInput && (
          <form onSubmit={handleAddTodo} className="mb-4 p-4 rounded-lg border border-border bg-secondary/40 space-y-3 animate-in-up">
            <Input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="h-10 text-sm"
            />
            <div className="flex gap-2 flex-wrap">
              {/* Priority selector */}
              <div className="flex items-center gap-0.5 p-0.5 bg-card rounded border border-border">
                <Flag className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setNewTodoPriority(p.value)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded transition-all",
                      newTodoPriority === p.value
                        ? `${p.color} bg-secondary`
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Time input */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-card rounded-lg border border-border">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="time"
                  value={newTodoTime}
                  onChange={(e) => setNewTodoTime(e.target.value)}
                  className="text-xs bg-transparent outline-none text-foreground w-24"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="gradient-primary text-primary-foreground hover:opacity-90 flex-1">
                Add Task
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setShowInput(false); setNewTodoText("") }}
                className="hover:bg-muted"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Todo list */}
        <div className="space-y-2">
          {sortedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} onUpdate={loadTodos} />
          ))}

          {sortedTodos.length === 0 && !showInput && (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {filter !== "all" ? `No ${filter} tasks` : "No tasks yet"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {filter === "all" ? "Add your first task for the day" : `Switch to "All" to see all tasks`}
              </p>
              {filter === "all" && (
                <Button onClick={() => setShowInput(true)} className="gradient-primary text-primary-foreground h-9 text-sm btn-press">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Task
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
