"use client"

import type { User } from "@/lib/types"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface DashboardHeaderProps {
  user: User
  currentDate: string
}

export function DashboardHeader({ user, currentDate }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const date = new Date(currentDate + "T00:00:00")
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
  const monthName = date.toLocaleDateString("en-US", { month: "long" })
  const dayNum = date.getDate()

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-4xl font-semibold mb-1">{dayName}</h1>
          <p className="text-lg text-muted-foreground">{monthName} {dayNum}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground btn-press"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-muted-foreground">Hello, {user.name}</p>
    </header>
  )
}
