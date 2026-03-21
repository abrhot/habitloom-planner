import { createClient } from "./supabase/client"
import type { Challenge, StreakInfo, Todo, TodoPriority, Event } from "./types"

// ────────────────────────────────────────────────────────────────
// CHALLENGES
// ────────────────────────────────────────────────────────────────

export async function getChallenges(userId: string): Promise<Challenge[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapChallenge)
}

export async function createChallenge(userId: string, title: string, color: string): Promise<Challenge> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("challenges")
    .insert({ user_id: userId, title, color })
    .select()
    .single()

  if (error) throw error
  return mapChallenge(data)
}

export async function archiveChallenge(challengeId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("challenges")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", challengeId)

  if (error) throw error
}

export async function deleteChallenge(challengeId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("challenges")
    .delete()
    .eq("id", challengeId)

  if (error) throw error
}

// ────────────────────────────────────────────────────────────────
// CHALLENGE LOGS (streak tracking)
// ────────────────────────────────────────────────────────────────

export async function getChallengeLogsForChallenge(challengeId: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("challenge_logs")
    .select("date")
    .eq("challenge_id", challengeId)
    .order("date", { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => r.date as string)
}

export async function toggleChallengeLog(
  challengeId: string,
  userId: string,
  date: string
): Promise<boolean> {
  const supabase = createClient()

  // Check if log exists
  const { data: existing } = await supabase
    .from("challenge_logs")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("date", date)
    .single()

  if (existing) {
    // Remove log (unmark)
    await supabase.from("challenge_logs").delete().eq("id", existing.id)
    return false
  } else {
    // Add log (mark done)
    await supabase.from("challenge_logs").insert({ challenge_id: challengeId, user_id: userId, date })
    return true
  }
}

export function calculateStreakFromDates(dates: string[]): StreakInfo {
  if (dates.length === 0) return { current: 0, longest: 0, total: dates.length }

  const sorted = [...dates].sort((a, b) => b.localeCompare(a))
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  let current = 0
  let longest = 0
  let streak = 0

  // Current streak
  let checkDate = sorted[0] === today || sorted[0] === yesterday ? sorted[0] : null
  if (checkDate) {
    for (const d of sorted) {
      const expected = new Date(new Date(checkDate).getTime() - (d === checkDate ? 0 : 86400000))
        .toISOString()
        .split("T")[0]
      if (d === checkDate || d === expected) {
        current++
        checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split("T")[0]
      } else {
        break
      }
    }
  }

  // Longest streak
  const dateSet = new Set(sorted)
  for (const d of sorted) {
    const prev = new Date(new Date(d).getTime() - 86400000).toISOString().split("T")[0]
    if (!dateSet.has(prev)) {
      streak = 1
      let next = d
      while (true) {
        const n = new Date(new Date(next).getTime() + 86400000).toISOString().split("T")[0]
        if (dateSet.has(n)) { streak++; next = n } else break
      }
      longest = Math.max(longest, streak)
    }
  }

  return { current, longest, total: dates.length }
}

// ────────────────────────────────────────────────────────────────
// TODOS
// ────────────────────────────────────────────────────────────────

export async function getTodos(userId: string, date: string): Promise<Todo[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapTodo)
}

export async function createTodo(
  userId: string,
  date: string,
  text: string,
  time?: string,
  priority?: TodoPriority
): Promise<Todo> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("todos")
    .insert({ user_id: userId, date, text, time: time ?? null, priority: priority ?? "medium" })
    .select()
    .single()

  if (error) throw error
  return mapTodo(data)
}

export async function toggleTodo(todoId: string): Promise<void> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("todos")
    .select("completed")
    .eq("id", todoId)
    .single()

  if (!existing) return

  const { error } = await supabase
    .from("todos")
    .update({ completed: !existing.completed })
    .eq("id", todoId)

  if (error) throw error
}

export async function updateTodo(
  todoId: string,
  updates: Partial<Pick<Todo, "text" | "time" | "priority" | "completed">>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("todos").update(updates).eq("id", todoId)
  if (error) throw error
}

export async function deleteTodo(todoId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("todos").delete().eq("id", todoId)
  if (error) throw error
}

// ────────────────────────────────────────────────────────────────
// EVENTS
// ────────────────────────────────────────────────────────────────

export async function getEvents(userId: string): Promise<Event[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapEvent)
}

export async function addEvent(
  userId: string,
  eventData: { title: string; date: string; note?: string; color?: string; time?: string }
): Promise<Event> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: userId,
      title: eventData.title,
      date: eventData.date,
      time: eventData.time ?? null,
      note: eventData.note ?? null,
      color: eventData.color ?? "#334155",
    })
    .select()
    .single()

  if (error) throw error
  return mapEvent(data)
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Pick<Event, "title" | "date" | "note" | "color" | "time">>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("events").update(updates).eq("id", eventId)
  if (error) throw error
}

export async function deleteEvent(eventId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("events").delete().eq("id", eventId)
  if (error) throw error
}

// ────────────────────────────────────────────────────────────────
// Mappers — DB row → app type
// ────────────────────────────────────────────────────────────────

function mapChallenge(row: Record<string, unknown>): Challenge {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    color: row.color as string,
    createdAt: row.created_at as string,
    archivedAt: (row.archived_at as string) ?? undefined,
  }
}

function mapTodo(row: Record<string, unknown>): Todo {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    text: row.text as string,
    completed: row.completed as boolean,
    time: (row.time as string) ?? undefined,
    priority: (row.priority as TodoPriority) ?? "medium",
    createdAt: row.created_at as string,
  }
}

function mapEvent(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    date: row.date as string,
    time: (row.time as string) ?? undefined,
    note: (row.note as string) ?? undefined,
    color: (row.color as string) ?? "#334155",
    createdAt: row.created_at as string,
  }
}
