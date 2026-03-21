export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Challenge {
  id: string
  userId: string
  title: string
  color: string
  createdAt: string
  archivedAt?: string
}

export interface ChallengeDay {
  id: string
  challengeId: string
  date: string
  completed: boolean
  note?: string
}

export type TodoPriority = "low" | "medium" | "high"

export interface Todo {
  id: string
  userId: string
  date: string
  text: string
  completed: boolean
  createdAt: string
  time?: string
  priority?: TodoPriority
}

export interface Event {
  id: string
  userId: string
  date: string
  title: string
  createdAt: string
  note?: string
  color?: string
  time?: string
}


export interface StreakInfo {
  current: number
  longest: number
  total: number
  lastCompletedDate?: string
}
