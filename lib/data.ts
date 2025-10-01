import type { Challenge, ChallengeDay, Todo, Event, StreakInfo } from "./types"

const CHALLENGES_KEY = "habitloom_challenges"
const CHALLENGE_DAYS_KEY = "habitloom_challenge_days"
const TODOS_KEY = "habitloom_todos"
const EVENTS_KEY = "habitloom_events"

// Challenge functions
export function getChallenges(userId: string): Challenge[] {
  const stored = localStorage.getItem(CHALLENGES_KEY)
  if (!stored) return []

  try {
    const all: Challenge[] = JSON.parse(stored)
    return all.filter((c) => c.userId === userId && !c.archivedAt)
  } catch {
    return []
  }
}

export function createChallenge(userId: string, title: string, color: string): Challenge {
  const challenges = getAllChallenges()

  const newChallenge: Challenge = {
    id: crypto.randomUUID(),
    userId,
    title,
    color,
    createdAt: new Date().toISOString(),
  }

  challenges.push(newChallenge)
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges))

  return newChallenge
}

export function archiveChallenge(challengeId: string) {
  const challenges = getAllChallenges()
  const challenge = challenges.find((c) => c.id === challengeId)

  if (challenge) {
    challenge.archivedAt = new Date().toISOString()
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges))
  }
}

// Challenge Day functions
export function getChallengeDays(challengeId: string): ChallengeDay[] {
  const stored = localStorage.getItem(CHALLENGE_DAYS_KEY)
  if (!stored) return []

  try {
    const all: ChallengeDay[] = JSON.parse(stored)
    return all.filter((cd) => cd.challengeId === challengeId)
  } catch {
    return []
  }
}

export function toggleChallengeDay(challengeId: string, date: string, note?: string): ChallengeDay {
  const allDays = getAllChallengeDays()
  const existing = allDays.find((cd) => cd.challengeId === challengeId && cd.date === date)

  if (existing) {
    existing.completed = !existing.completed
    if (note !== undefined) existing.note = note
    localStorage.setItem(CHALLENGE_DAYS_KEY, JSON.stringify(allDays))
    return existing
  }

  const newDay: ChallengeDay = {
    id: crypto.randomUUID(),
    challengeId,
    date,
    completed: true,
    note,
  }

  allDays.push(newDay)
  localStorage.setItem(CHALLENGE_DAYS_KEY, JSON.stringify(allDays))

  return newDay
}

export function calculateStreak(challengeId: string): StreakInfo {
  const days = getChallengeDays(challengeId)
    .filter((d) => d.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (days.length === 0) {
    return { current: 0, longest: 0 }
  }

  let current = 0
  let longest = 0
  let tempStreak = 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const mostRecent = new Date(days[0].date)
  mostRecent.setHours(0, 0, 0, 0)

  // Check if streak is current (today or yesterday)
  if (mostRecent.getTime() === today.getTime() || mostRecent.getTime() === yesterday.getTime()) {
    current = 1

    for (let i = 1; i < days.length; i++) {
      const currentDate = new Date(days[i].date)
      const prevDate = new Date(days[i - 1].date)

      const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        current++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  longest = tempStreak
  for (let i = 1; i < days.length; i++) {
    const currentDate = new Date(days[i].date)
    const prevDate = new Date(days[i - 1].date)

    const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
      longest = Math.max(longest, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return {
    current,
    longest,
    lastCompletedDate: days[0]?.date,
  }
}

// Todo functions
export function getTodos(userId: string, date: string): Todo[] {
  const stored = localStorage.getItem(TODOS_KEY)
  if (!stored) return []

  try {
    const all: Todo[] = JSON.parse(stored)
    return all.filter((t) => t.userId === userId && t.date === date)
  } catch {
    return []
  }
}

export function createTodo(userId: string, date: string, text: string, time?: string): Todo {
  const todos = getAllTodos()

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    userId,
    date,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    time,
  }

  todos.push(newTodo)
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos))

  return newTodo
}

export function updateTodo(todoId: string, updates: Partial<Pick<Todo, "text" | "time">>): void {
  const todos = getAllTodos()
  const todo = todos.find((t) => t.id === todoId)

  if (todo) {
    if (updates.text !== undefined) todo.text = updates.text
    if (updates.time !== undefined) todo.time = updates.time
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos))
  }
}

export function toggleTodo(todoId: string) {
  const todos = getAllTodos()
  const todo = todos.find((t) => t.id === todoId)

  if (todo) {
    todo.completed = !todo.completed
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos))
  }
}

export function deleteTodo(todoId: string) {
  const todos = getAllTodos()
  const filtered = todos.filter((t) => t.id !== todoId)
  localStorage.setItem(TODOS_KEY, JSON.stringify(filtered))
}

// Event functions
export function getEvents(userId: string, date?: string): Event[] {
  const stored = localStorage.getItem(EVENTS_KEY)
  if (!stored) return []

  try {
    const all: Event[] = JSON.parse(stored)
    if (date) {
      return all.filter((e) => e.userId === userId && e.date === date)
    }
    return all.filter((e) => e.userId === userId)
  } catch {
    return []
  }
}

export function getAllEvents(): Event[] {
  const stored = localStorage.getItem(EVENTS_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function createEvent(userId: string, date: string, title: string): Event {
  const events = getAllEvents()

  const newEvent: Event = {
    id: crypto.randomUUID(),
    userId,
    date,
    title,
    createdAt: new Date().toISOString(),
  }

  events.push(newEvent)
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))

  return newEvent
}

export function deleteEvent(eventId: string) {
  const events = getAllEvents()
  const filtered = events.filter((e) => e.id !== eventId)
  localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered))
}

export function addEvent(
  userId: string,
  eventData: {
    title: string
    date: string
    note?: string
  },
): Event {
  const events = getAllEvents()

  const newEvent: Event = {
    id: crypto.randomUUID(),
    userId,
    date: eventData.date,
    title: eventData.title,
    note: eventData.note,
    createdAt: new Date().toISOString(),
  }

  events.push(newEvent)
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))

  return newEvent
}

// Helper functions
function getAllChallenges(): Challenge[] {
  const stored = localStorage.getItem(CHALLENGES_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function getAllChallengeDays(): ChallengeDay[] {
  const stored = localStorage.getItem(CHALLENGE_DAYS_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function getAllTodos(): Todo[] {
  const stored = localStorage.getItem(TODOS_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}
