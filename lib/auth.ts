import type { User } from "./types"

const STORAGE_KEY = "habitloom_user"

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function login(email: string, password: string): User | null {
  // Mock login - in production this would call an API
  const users = getStoredUsers()
  const user = users.find((u) => u.email === email)

  if (!user) return null

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function register(email: string, password: string, name: string): User {
  // Mock registration - in production this would call an API
  const users = getStoredUsers()

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("habitloom_users", JSON.stringify(users))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))

  return newUser
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

function getStoredUsers(): User[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("habitloom_users")
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}
