"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut } from "@/lib/auth"
import type { User } from "@/lib/types"
import { getChallenges, getTodos, getEvents, getChallengeLogsForChallenge, calculateStreakFromDates } from "@/lib/data"
import { getToday } from "@/lib/date-utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { LogOut, Target, CheckSquare, Calendar, TrendingUp } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    challenges: 0,
    totalStreak: 0,
    bestStreak: 0,
    todayDone: 0,
    todayTotal: 0,
    upcomingEvents: 0,
  })

  const loadStats = useCallback(async (userId: string) => {
    const today = getToday()
    const [challenges, todos, events] = await Promise.all([
      getChallenges(userId),
      getTodos(userId, today),
      getEvents(userId),
    ])

    const active = challenges.filter((c) => !c.archivedAt)
    const streaks = await Promise.all(
      active.map((c) => getChallengeLogsForChallenge(c.id).then(calculateStreakFromDates))
    )

    setStats({
      challenges: active.length,
      totalStreak: streaks.reduce((s, st) => s + (st.current ?? 0), 0),
      bestStreak:  streaks.reduce((m, st) => Math.max(m, st.longest ?? 0), 0),
      todayDone:   todos.filter((t) => t.completed).length,
      todayTotal:  todos.length,
      upcomingEvents: events.filter((e) => e.date >= today).length,
    })
  }, [])

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      if (!currentUser) { router.push("/"); return }
      setUser(currentUser)
      loadStats(currentUser.id).finally(() => setLoading(false))
    })
  }, [router, loadStats])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const memberSince = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
    if (days === 0) return "Joined today"
    if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`
    const months = Math.floor(days / 30)
    return `${months} month${months > 1 ? "s" : ""}`
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  const statRows = [
    { label: "Active Challenges", value: stats.challenges,                       icon: Target },
    { label: "Current Streak",    value: `${stats.totalStreak}d`,                icon: TrendingUp },
    { label: "Best Streak",       value: `${stats.bestStreak}d`,                 icon: TrendingUp },
    { label: "Tasks Today",       value: `${stats.todayDone}/${stats.todayTotal}`, icon: CheckSquare },
    { label: "Upcoming Events",   value: stats.upcomingEvents,                   icon: Calendar },
  ]

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-xl mx-auto space-y-6">

          <div>
            <p className="text-label mb-1">Account</p>
            <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          </div>

          {/* Identity card */}
          <div className="section-box overflow-hidden">
            <div className="px-5 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary-foreground">{initials(user.name)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Member for {memberSince(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="section-box overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Statistics</h2>
            </div>
            <div className="divide-y divide-border">
              {statRows.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground stat-number">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div className="section-box overflow-hidden border-destructive/20">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Account Actions</h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground mb-4">
                Signing out will end your session on this device.
              </p>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive h-9 text-sm btn-press"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
