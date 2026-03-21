"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/lib/types"
import { getToday } from "@/lib/date-utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DateNavigator } from "@/components/date-navigator"
import { TodosSection } from "@/components/todos-section"

export default function TodosPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [currentDate, setCurrentDate] = useState(getToday())

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      if (!currentUser) { router.push("/"); return }
      setUser(currentUser)
    })
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <p className="text-label mb-1">Daily</p>
            <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
          </div>

          <DateNavigator currentDate={currentDate} onDateChange={setCurrentDate} />

          <TodosSection userId={user.id} currentDate={currentDate} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
