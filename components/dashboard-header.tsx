"use client"

import type { User } from "@/lib/types"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface DashboardHeaderProps {
  user: User
  currentDate: string
}

export function DashboardHeader({ user, currentDate }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    logout()
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
          <h1 className="text-4xl font-semibold mb-1 text-balance">{dayName}</h1>
          <p className="text-lg text-muted-foreground">
            {monthName} {dayNum}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Log out</span>
        </Button>
      </div>
      <p className="text-muted-foreground">Hello, {user.name}</p>
    </header>
  )
}
