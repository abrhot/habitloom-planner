"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

const quotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
  },
  {
    text: "Consistency is what transforms average into excellence.",
    author: "Unknown",
  },
]

export function QuoteOfDay() {
  const [quote, setQuote] = useState(quotes[0])

  useEffect(() => {
    // Get quote based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setQuote(quotes[dayOfYear % quotes.length])
  }, [])

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
        <div>
          <p className="text-lg font-medium text-foreground mb-2 leading-relaxed">"{quote.text}"</p>
          <p className="text-sm text-muted-foreground">— {quote.author}</p>
        </div>
      </div>
    </div>
  )
}
