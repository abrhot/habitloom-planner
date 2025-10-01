"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addDays, isToday } from "@/lib/date-utils"

interface DateNavigatorProps {
  currentDate: string
  onDateChange: (date: string) => void
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const handlePrevDay = () => {
    onDateChange(addDays(currentDate, -1))
  }

  const handleNextDay = () => {
    onDateChange(addDays(currentDate, 1))
  }

  const handleToday = () => {
    onDateChange(new Date().toISOString().split("T")[0])
  }

  return (
    <div className="flex items-center gap-2 mb-6">
      <Button variant="outline" size="icon" onClick={handlePrevDay} className="h-9 w-9 bg-transparent">
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous day</span>
      </Button>

      {!isToday(currentDate) && (
        <Button variant="outline" onClick={handleToday} className="h-9 px-4 bg-transparent">
          Today
        </Button>
      )}

      <Button variant="outline" size="icon" onClick={handleNextDay} className="h-9 w-9 bg-transparent">
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next day</span>
      </Button>
    </div>
  )
}
