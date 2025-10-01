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
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">To-do List</h1>
            <p className="text-muted-foreground">Manage your daily tasks</p>
          </div>

          <DateNavigator currentDate={currentDate} onDateChange={setCurrentDate} />

          <TodosSection userId={user.id} currentDate={currentDate} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
