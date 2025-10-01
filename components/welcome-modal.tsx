"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface WelcomeModalProps {
  userName: string
  onClose: () => void
}

export function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-balance">Welcome to Habitloom, {userName}!</h2>
          <p className="text-muted-foreground text-pretty">Your minimal daily planner and consistency tracker</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-medium mb-1">Track your challenges</h3>
            <p className="text-sm text-muted-foreground text-pretty">
              Create habits you want to build and track your consistency with visual grids
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-1">Manage daily todos</h3>
            <p className="text-sm text-muted-foreground text-pretty">
              Add tasks for each day and watch your progress grow
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-1">Plan with events</h3>
            <p className="text-sm text-muted-foreground text-pretty">Keep track of important dates and appointments</p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Get started
        </Button>
      </Card>
    </div>
  )
}
