"use client"

import { useEffect, useState } from "react"

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The difference between who you are and who you want to be is what you do.", author: "Unknown" },
]

export function QuoteOfDay() {
  const [quote, setQuote] = useState(quotes[0])

  useEffect(() => {
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setQuote(quotes[day % quotes.length])
  }, [])

  return (
    <div className="border-l-2 border-accent-warm pl-4 py-1">
      <p className="text-sm text-foreground leading-relaxed">
        "{quote.text}"
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 font-medium">— {quote.author}</p>
    </div>
  )
}
